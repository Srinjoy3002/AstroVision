from app import db
from datetime import datetime

class ProcessingJob(db.Model):
    """Model for tracking DEM processing jobs."""
    id = db.Column(db.String(36), primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='pending')  # pending, processing, completed, failed
    scale_factor = db.Column(db.Float, default=1.0)
    smoothing = db.Column(db.Integer, default=3)
    elevation_range = db.Column(db.Float, default=255.0)
    output_files = db.Column(db.Text)  # JSON string of output file paths
    processing_log = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<ProcessingJob {self.id}: {self.filename}>'
