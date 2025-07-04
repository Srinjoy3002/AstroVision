import os
import logging
from flask import Flask, render_template, request, jsonify, send_file, flash, redirect, url_for, session
from werkzeug.utils import secure_filename
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import uuid
from datetime import datetime, timezone, timedelta
from dem_processor import DEMProcessor

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///dem_converter.db")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# File upload configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'tiff', 'tif'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Ensure upload and output directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Initialize the app with the extension
db.init_app(app)

with app.app_context():
    # Import models to create tables
    import models
    db.create_all()

# Template context processor to make timezone functions available in templates
@app.context_processor
def utility_processor():
    return dict(timezone=timezone, timedelta=timedelta)

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/results")
def show_results():
    return render_template("results_new.html")

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and initiate DEM processing."""
    try:
        if 'file' not in request.files:
            flash('No file selected', 'error')
            return redirect(url_for('index'))
        
        file = request.files['file']
        if file.filename == '':
            flash('No file selected', 'error')
            return redirect(url_for('index'))
        
        if not allowed_file(file.filename):
            flash('Invalid file format. Please upload PNG, JPEG, or TIFF images.', 'error')
            return redirect(url_for('index'))
        
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())
        file_extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{unique_id}.{file_extension}"
        
        # Save uploaded file
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Get processing parameters from form
        scale_factor = float(request.form.get('scale_factor', 1.0))
        smoothing = int(request.form.get('smoothing', 3))
        elevation_range = float(request.form.get('elevation_range', 255.0))
        
        # Create processing record
        from models import ProcessingJob
        job = ProcessingJob(
            id=unique_id,
            filename=filename,
            filepath=unique_filename,
            scale_factor=scale_factor,
            smoothing=smoothing,
            elevation_range=elevation_range,
            status='processing',
            created_at=datetime.utcnow()
        )
        db.session.add(job)
        db.session.commit()
        
        # Store job ID in session for tracking
        session['job_id'] = unique_id
        
        # Process the image
        processor = DEMProcessor()
        try:
            result = processor.process_image(
                filepath, 
                output_folder=app.config['OUTPUT_FOLDER'],
                job_id=unique_id,
                scale_factor=scale_factor,
                smoothing=smoothing,
                elevation_range=elevation_range
            )
            
            # Update job status
            job.status = 'completed'
            job.output_files = result['output_files']
            job.processing_log = result['log']
            job.completed_at = datetime.utcnow()
            db.session.commit()
            
            flash('DEM processing completed successfully!', 'success')
            return redirect(url_for('results', job_id=unique_id))
            
        except Exception as e:
            logging.error(f"Processing error: {str(e)}")
            job.status = 'failed'
            job.processing_log = f"Error: {str(e)}"
            db.session.commit()
            flash(f'Processing failed: {str(e)}', 'error')
            return redirect(url_for('index'))
            
    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        flash(f'Upload failed: {str(e)}', 'error')
        return redirect(url_for('index'))

@app.route('/results/<job_id>')
def results(job_id):
    """Display processing results."""
    from models import ProcessingJob
    job = ProcessingJob.query.get_or_404(job_id)
    
    if job.status != 'completed':
        flash('Processing not completed or failed', 'error')
        return redirect(url_for('index'))
    
    return render_template('results.html', job=job)

@app.route('/download/<job_id>/<file_type>')
def download_file(job_id, file_type):
    """Download generated DEM files."""
    from models import ProcessingJob
    job = ProcessingJob.query.get_or_404(job_id)
    
    if job.status != 'completed':
        flash('File not available', 'error')
        return redirect(url_for('index'))
    
    filename_map = {
        'dem': f"{job_id}_dem.tif",
        'ascii': f"{job_id}_dem.asc", 
        'visualization': f"{job_id}_3d_plot.html",
        'dem_image': f"{job_id}_dem_image.png",
        'dem_topview': f"{job_id}_dem_image_topview.png",
        'dem_grayscale': f"{job_id}_dem_image_grayscale.png"
    }
    
    if file_type not in filename_map:
        flash('Invalid file type', 'error')
        return redirect(url_for('results', job_id=job_id))
    
    filepath = os.path.join(app.config['OUTPUT_FOLDER'], filename_map[file_type])
    
    if not os.path.exists(filepath):
        flash('File not found', 'error')
        return redirect(url_for('results', job_id=job_id))
    
    # For HTML visualization files, serve inline for iframe viewing
    if file_type == 'visualization':
        return send_file(filepath, as_attachment=False, mimetype='text/html')
    else:
        return send_file(filepath, as_attachment=True)

@app.route('/status/<job_id>')
def get_status(job_id):
    """Get processing status (for AJAX requests)."""
    from models import ProcessingJob
    job = ProcessingJob.query.get_or_404(job_id)
    
    return jsonify({
        'status': job.status,
        'log': job.processing_log,
        'created_at': job.created_at.isoformat() if job.created_at else None,
        'completed_at': job.completed_at.isoformat() if job.completed_at else None
    })

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error."""
    flash("File is too large. Maximum size is 16MB.", 'error')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
