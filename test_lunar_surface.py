#!/usr/bin/env python3
"""
Create a test lunar surface image for DEM processing
"""
import numpy as np
import cv2
from PIL import Image
import matplotlib.pyplot as plt

def create_test_lunar_surface():
    """Create a synthetic lunar surface image with realistic features"""
    # Create base image
    width, height = 512, 512
    
    # Generate base terrain using multiple Perlin-like noise layers
    x = np.linspace(0, 4*np.pi, width)
    y = np.linspace(0, 4*np.pi, height)
    X, Y = np.meshgrid(x, y)
    
    # Create realistic lunar terrain
    # Large scale features (mountains, valleys)
    terrain1 = np.sin(X) * np.cos(Y) * 0.3
    
    # Medium scale features (hills, ridges)
    terrain2 = np.sin(X * 2) * np.cos(Y * 1.5) * 0.2
    
    # Small scale features (craters, rocks)
    terrain3 = np.sin(X * 8) * np.cos(Y * 6) * 0.1
    
    # Add some random noise for texture
    noise = np.random.normal(0, 0.05, (height, width))
    
    # Combine all terrain features
    combined_terrain = terrain1 + terrain2 + terrain3 + noise
    
    # Add some circular crater-like features
    center_x, center_y = width // 2, height // 2
    crater_radius = 80
    for i in range(height):
        for j in range(width):
            dist = np.sqrt((i - center_y)**2 + (j - center_x)**2)
            if dist < crater_radius:
                crater_depth = (crater_radius - dist) / crater_radius * 0.4
                combined_terrain[i, j] -= crater_depth
    
    # Add a smaller crater
    center_x2, center_y2 = width // 4, 3 * height // 4
    crater_radius2 = 40
    for i in range(height):
        for j in range(width):
            dist = np.sqrt((i - center_y2)**2 + (j - center_x2)**2)
            if dist < crater_radius2:
                crater_depth = (crater_radius2 - dist) / crater_radius2 * 0.3
                combined_terrain[i, j] -= crater_depth
    
    # Normalize to 0-255 range
    combined_terrain = (combined_terrain - combined_terrain.min()) / (combined_terrain.max() - combined_terrain.min())
    
    # Apply some lunar-like contrast
    combined_terrain = np.power(combined_terrain, 0.7)  # Gamma correction for more realistic shadows
    
    # Convert to 8-bit grayscale
    lunar_surface = (combined_terrain * 255).astype(np.uint8)
    
    return lunar_surface

if __name__ == "__main__":
    # Create test image
    print("Creating test lunar surface image...")
    lunar_image = create_test_lunar_surface()
    
    # Save as PNG
    output_path = "uploads/test_lunar_surface.png"
    Image.fromarray(lunar_image, mode='L').save(output_path)
    print(f"Test image saved to: {output_path}")
    
    # Display image info
    print(f"Image size: {lunar_image.shape}")
    print(f"Pixel value range: {lunar_image.min()} - {lunar_image.max()}")
    
    # Also save a preview
    plt.figure(figsize=(10, 8))
    plt.imshow(lunar_image, cmap='gray')
    plt.title('Test Lunar Surface Image\n(Synthetic terrain with craters for DEM testing)')
    plt.axis('off')
    plt.tight_layout()
    plt.savefig('uploads/test_lunar_surface_preview.png', dpi=150, bbox_inches='tight')
    plt.close()
    
    print("Test image and preview created successfully!")