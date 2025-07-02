import cv2
import numpy as np
import os
import logging
from PIL import Image, ImageEnhance
import json
import plotly.graph_objects as go
import plotly.offline as pyo
from scipy import ndimage
from scipy.interpolate import griddata

class DEMProcessor:
    """Digital Elevation Model processor using height-from-shading techniques."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def process_image(self, input_path, output_folder, job_id, scale_factor=1.0, smoothing=3, elevation_range=255.0):
        """
        Process a 2D image to generate a Digital Elevation Model.
        
        Args:
            input_path: Path to input image
            output_folder: Directory to save output files
            job_id: Unique identifier for this processing job
            scale_factor: Scaling factor for elevation values
            smoothing: Gaussian blur kernel size for smoothing
            elevation_range: Maximum elevation value in meters
        
        Returns:
            Dictionary with processing results and output file paths
        """
        try:
            log_messages = []
            log_messages.append("Starting DEM processing...")
            
            # Load and preprocess image
            log_messages.append("Loading image...")
            image = cv2.imread(input_path)
            if image is None:
                raise ValueError("Could not load image file")
            
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            
            log_messages.append(f"Image loaded: {gray.shape[1]}x{gray.shape[0]} pixels")
            
            # Enhance contrast for better height estimation
            log_messages.append("Enhancing image contrast...")
            enhanced = self._enhance_contrast(gray)
            
            # Apply height-from-shading algorithm
            log_messages.append("Applying height-from-shading algorithm...")
            dem_data = self._height_from_shading(enhanced, scale_factor, smoothing, elevation_range)
            
            # Generate output files
            output_files = {}
            
            # Save DEM as visual image (colorized height map)
            log_messages.append("Generating DEM visualization image...")
            dem_image_path = os.path.join(output_folder, f"{job_id}_dem_image.png")
            self._save_dem_image(dem_data, dem_image_path)
            output_files['dem_image'] = f"{job_id}_dem_image.png"
            
            # Save DEM as GeoTIFF
            log_messages.append("Saving DEM as GeoTIFF...")
            dem_tiff_path = os.path.join(output_folder, f"{job_id}_dem.tif")
            self._save_geotiff(dem_data, dem_tiff_path)
            output_files['dem_tiff'] = f"{job_id}_dem.tif"
            
            # Save DEM as ASCII Grid
            log_messages.append("Saving DEM as ASCII Grid...")
            dem_ascii_path = os.path.join(output_folder, f"{job_id}_dem.asc")
            self._save_ascii_grid(dem_data, dem_ascii_path)
            output_files['dem_ascii'] = f"{job_id}_dem.asc"
            
            # Generate 3D visualization
            log_messages.append("Generating 3D visualization...")
            viz_path = os.path.join(output_folder, f"{job_id}_3d_plot.html")
            self._create_3d_visualization(dem_data, viz_path, job_id)
            output_files['visualization'] = f"{job_id}_3d_plot.html"
            
            # Generate statistics
            log_messages.append("Computing DEM statistics...")
            stats = self._compute_statistics(dem_data)
            log_messages.extend([
                f"Elevation range: {stats['min_elevation']:.2f} - {stats['max_elevation']:.2f} m",
                f"Mean elevation: {stats['mean_elevation']:.2f} m",
                f"Standard deviation: {stats['std_elevation']:.2f} m"
            ])
            
            log_messages.append("DEM processing completed successfully!")
            
            return {
                'status': 'success',
                'output_files': json.dumps(output_files),
                'statistics': stats,
                'log': '\n'.join(log_messages)
            }
            
        except Exception as e:
            error_msg = f"Processing failed: {str(e)}"
            self.logger.error(error_msg)
            return {
                'status': 'error',
                'error': error_msg,
                'log': '\n'.join(log_messages + [error_msg])
            }
    
    def _enhance_contrast(self, image):
        """Enhance image contrast using adaptive histogram equalization."""
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(image)
        return enhanced
    
    def _height_from_shading(self, image, scale_factor, smoothing, elevation_range):
        """
        Convert grayscale image to elevation data using improved height-from-shading.
        
        This approach creates a more realistic DEM that visually matches the original:
        - Direct intensity-to-height mapping with shading analysis
        - Preserves original surface features and patterns
        - Uses lighting assumptions to enhance terrain details
        """
        # Normalize image to 0-1 range
        img_norm = image.astype(np.float32) / 255.0
        
        # Apply gentle smoothing to reduce noise while preserving details
        if smoothing > 0:
            img_norm = cv2.GaussianBlur(img_norm, (smoothing*2+1, smoothing*2+1), 0)
        
        # Method 1: Direct intensity mapping (base height)
        # Lighter areas = higher elevation, darker = lower
        base_height = img_norm.copy()
        
        # Method 2: Enhance with gradient information for surface details
        sobel_x = cv2.Sobel(img_norm, cv2.CV_64F, 1, 0, ksize=3) 
        sobel_y = cv2.Sobel(img_norm, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(sobel_x**2 + sobel_y**2)
        
        # Normalize gradients
        gradient_magnitude = gradient_magnitude / (gradient_magnitude.max() + 1e-8)
        
        # Combine base height with gradient details (weighted combination)
        # This preserves the original image appearance while adding surface detail
        alpha = 0.7  # Weight for base intensity
        beta = 0.3   # Weight for gradient details
        
        dem_estimate = alpha * base_height + beta * gradient_magnitude
        
        # Method 3: Apply shape-from-shading enhancement
        # Assume light source from top-left (standard assumption)
        light_direction = np.array([-1, -1])  # Top-left lighting
        
        # Calculate surface normals from gradients
        normal_x = -sobel_x
        normal_y = -sobel_y
        normal_z = np.ones_like(sobel_x)
        
        # Normalize surface normals
        normal_length = np.sqrt(normal_x**2 + normal_y**2 + normal_z**2)
        normal_x /= normal_length + 1e-8
        normal_y /= normal_length + 1e-8
        normal_z /= normal_length + 1e-8
        
        # Compute shading based on light direction
        shading = np.maximum(0, -(normal_x * light_direction[0] + normal_y * light_direction[1]))
        
        # Enhance the DEM with shading information
        dem_estimate = dem_estimate + 0.2 * shading
        
        # Final processing: normalize and scale
        dem_estimate = np.clip(dem_estimate, 0, 1)
        dem_estimate = (dem_estimate - dem_estimate.min()) / (dem_estimate.max() - dem_estimate.min() + 1e-8)
        dem_estimate = dem_estimate * elevation_range * scale_factor
        
        # Light smoothing to reduce artifacts while preserving features
        dem_estimate = ndimage.gaussian_filter(dem_estimate, sigma=0.5)
        
        return dem_estimate
    
    def _save_dem_image(self, dem_data, output_path):
        """Save DEM data as a top-view visualization image."""
        import matplotlib.pyplot as plt
        import matplotlib.cm as cm
        from matplotlib.colors import Normalize
        
        # Create figure for top-view DEM
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 8), dpi=150)
        
        # Left plot: Colorized elevation map (top view)
        norm = Normalize(vmin=dem_data.min(), vmax=dem_data.max())
        im1 = ax1.imshow(dem_data, cmap='terrain', norm=norm, aspect='equal', origin='upper')
        ax1.set_title('DEM - Top View (Colorized)', fontsize=14, fontweight='bold')
        ax1.set_xlabel('X Coordinate', fontsize=11)
        ax1.set_ylabel('Y Coordinate', fontsize=11)
        
        # Add colorbar for elevation scale
        cbar1 = plt.colorbar(im1, ax=ax1, shrink=0.7)
        cbar1.set_label('Elevation (m)', rotation=270, labelpad=15, fontsize=10)
        
        # Right plot: Grayscale height map (top view)
        dem_normalized = (dem_data - dem_data.min()) / (dem_data.max() - dem_data.min())
        im2 = ax2.imshow(dem_normalized, cmap='gray', aspect='equal', origin='upper')
        ax2.set_title('DEM - Top View (Grayscale)', fontsize=14, fontweight='bold')
        ax2.set_xlabel('X Coordinate', fontsize=11)
        ax2.set_ylabel('Y Coordinate', fontsize=11)
        
        # Add colorbar for normalized scale
        cbar2 = plt.colorbar(im2, ax=ax2, shrink=0.7)
        cbar2.set_label('Normalized Height', rotation=270, labelpad=15, fontsize=10)
        
        # Remove tick marks for cleaner appearance
        for ax in [ax1, ax2]:
            ax.set_xticks([])
            ax.set_yticks([])
        
        # Add overall title
        fig.suptitle('Digital Elevation Model - Top View Analysis', fontsize=16, fontweight='bold', y=0.95)
        
        # Save with high quality
        plt.tight_layout()
        plt.subplots_adjust(top=0.88)
        plt.savefig(output_path, dpi=150, bbox_inches='tight', 
                   facecolor='white', edgecolor='none')
        plt.close()
        
        # Create a separate simple top-view image for web display that matches the original
        web_view_path = output_path.replace('.png', '_topview.png')
        fig_simple, ax_simple = plt.subplots(figsize=(10, 10), dpi=120)
        
        # Use terrain colormap for better visualization
        im_simple = ax_simple.imshow(dem_data, cmap='terrain', norm=norm, aspect='equal', origin='upper')
        ax_simple.set_title('Digital Elevation Model - Terrain Map', fontsize=16, fontweight='bold', pad=20)
        
        # Add elevation scale
        cbar_simple = plt.colorbar(im_simple, ax=ax_simple, shrink=0.8, pad=0.1)
        cbar_simple.set_label('Elevation (meters)', rotation=270, labelpad=20, fontsize=12)
        
        # Clean axes
        ax_simple.set_xticks([])
        ax_simple.set_yticks([])
        ax_simple.axis('off')
        
        plt.tight_layout()
        plt.savefig(web_view_path, dpi=120, bbox_inches='tight', 
                   facecolor='white', edgecolor='none')
        plt.close()
        
        # Also save a simple grayscale version
        grayscale_path = output_path.replace('.png', '_grayscale.png')
        dem_gray = ((dem_data - dem_data.min()) / (dem_data.max() - dem_data.min()) * 255).astype(np.uint8)
        Image.fromarray(dem_gray).save(grayscale_path)
    
    def _save_geotiff(self, dem_data, output_path):
        """Save DEM data as GeoTIFF format."""
        try:
            import rasterio
            from rasterio.transform import from_bounds
            from rasterio.crs import CRS
            
            # Create a simple transform (could be georeferenced in real applications)
            height, width = dem_data.shape
            transform = from_bounds(0, 0, width, height, width, height)
            
            with rasterio.open(
                output_path,
                'w',
                driver='GTiff',
                height=height,
                width=width,
                count=1,
                dtype=dem_data.dtype,
                crs=CRS.from_epsg(4326),  # WGS84
                transform=transform,
            ) as dst:
                dst.write(dem_data, 1)
                
        except ImportError:
            # Fallback: save as regular TIFF using PIL
            dem_scaled = ((dem_data - dem_data.min()) / (dem_data.max() - dem_data.min()) * 65535).astype(np.uint16)
            Image.fromarray(dem_scaled).save(output_path)
    
    def _save_ascii_grid(self, dem_data, output_path):
        """Save DEM data as ASCII Grid format."""
        height, width = dem_data.shape
        
        # ASCII Grid header
        header = f"""ncols {width}
nrows {height}
xllcorner 0.0
yllcorner 0.0
cellsize 1.0
NODATA_value -9999
"""
        
        # Write file
        with open(output_path, 'w') as f:
            f.write(header)
            for row in dem_data:
                row_str = ' '.join([f'{val:.6f}' for val in row])
                f.write(row_str + '\n')
    
    def _create_3d_visualization(self, dem_data, output_path, job_id):
        """Create interactive 3D visualization using Plotly."""
        try:
            # Downsample for performance if image is too large
            height, width = dem_data.shape
            max_size = 150  # Reduced for better performance
            
            if height > max_size or width > max_size:
                scale_factor = min(max_size / height, max_size / width)
                new_height = int(height * scale_factor)
                new_width = int(width * scale_factor)
                dem_viz = cv2.resize(dem_data, (new_width, new_height))
            else:
                dem_viz = dem_data
            
            # Create coordinate grids
            y_coords, x_coords = np.mgrid[0:dem_viz.shape[0], 0:dem_viz.shape[1]]
            
            # Create 3D surface plot with terrain color mapping for elevation
            # Use standard DEM colorscale that clearly shows elevation differences
            
            fig = go.Figure(data=[
                go.Surface(
                    z=dem_viz,
                    x=x_coords,
                    y=y_coords,
                    colorscale='earth',  # Earth colorscale for elevation mapping
                    colorbar=dict(title="Elevation (m)"),
                    contours=dict(
                        z=dict(show=True, usecolormap=True, project_z=True, size=5)
                    ),
                    lighting=dict(ambient=0.4, diffuse=0.8, fresnel=0.1, specular=0.05, roughness=0.05)
                )
            ])
            
            fig.update_layout(
                title=dict(
                    text=f'3D Digital Elevation Model',
                    x=0.5,
                    font=dict(size=16)
                ),
                scene=dict(
                    xaxis_title='X Coordinate (pixels)',
                    yaxis_title='Y Coordinate (pixels)', 
                    zaxis_title='Elevation (meters)',
                    camera=dict(eye=dict(x=1.5, y=1.5, z=1.2)),
                    bgcolor='rgba(0,0,0,0)',
                    xaxis=dict(backgroundcolor='rgba(0,0,0,0)', gridcolor='lightgray'),
                    yaxis=dict(backgroundcolor='rgba(0,0,0,0)', gridcolor='lightgray'),
                    zaxis=dict(backgroundcolor='rgba(0,0,0,0)', gridcolor='lightgray')
                ),
                width=800,
                height=600,
                margin=dict(l=0, r=0, t=40, b=0),
                paper_bgcolor='white',
                plot_bgcolor='white'
            )
            
            # Save as standalone HTML file
            html_string = fig.to_html(include_plotlyjs=True, div_id="dem-3d-plot")
            with open(output_path, 'w') as f:
                f.write(html_string)
                
        except Exception as e:
            self.logger.error(f"Error creating 3D visualization: {str(e)}")
            # Create a simple fallback HTML file
            fallback_html = f"""
            <!DOCTYPE html>
            <html>
            <head><title>3D DEM Visualization</title></head>
            <body>
                <div style="text-align: center; padding: 50px;">
                    <h2>3D Visualization Not Available</h2>
                    <p>Error creating 3D model: {str(e)}</p>
                    <p>Please download the GeoTIFF file for analysis in GIS software.</p>
                </div>
            </body>
            </html>
            """
            with open(output_path, 'w') as f:
                f.write(fallback_html)
    
    def _compute_statistics(self, dem_data):
        """Compute basic statistics for the DEM."""
        flat_data = dem_data.flatten()
        
        return {
            'min_elevation': float(np.min(flat_data)),
            'max_elevation': float(np.max(flat_data)),
            'mean_elevation': float(np.mean(flat_data)),
            'std_elevation': float(np.std(flat_data)),
            'total_pixels': int(len(flat_data))
        }
