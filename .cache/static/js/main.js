/**
 * Planetary DEM Converter - Main JavaScript File
 * Handles form validation, file upload preview, and UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeFileUpload();
    initializeFormValidation();
    initializeParameterControls();
    addAnimations();
});

/**
 * Initialize file upload functionality
 */
function initializeFileUpload() {
    const fileInput = document.getElementById('file');
    if (!fileInput) return;

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            validateFile(file);
            showFilePreview(file);
        }
    });

    // Drag and drop functionality
    const uploadArea = fileInput.closest('.mb-4');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }
}

/**
 * Validate uploaded file
 */
function validateFile(file) {
    const maxSize = 16 * 1024 * 1024; // 16MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/tiff', 'image/tif'];
    
    // Check file size
    if (file.size > maxSize) {
        showAlert('File size exceeds 16MB limit. Please choose a smaller image.', 'error');
        document.getElementById('file').value = '';
        return false;
    }
    
    // Check file type
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(tiff?|png|jpe?g)$/)) {
        showAlert('Invalid file format. Please upload PNG, JPEG, or TIFF images only.', 'error');
        document.getElementById('file').value = '';
        return false;
    }
    
    return true;
}

/**
 * Show file preview information
 */
function showFilePreview(file) {
    const formText = document.querySelector('#file + .form-text');
    if (formText) {
        const fileSize = formatFileSize(file.size);
        const fileType = file.type || 'Unknown';
        formText.innerHTML = `
            <i class="fas fa-check-circle text-success me-2"></i>
            Selected: <strong>${file.name}</strong> (${fileSize}, ${fileType})
        `;
    }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Handle drag over event
 */
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.backgroundColor = 'rgba(0, 102, 204, 0.1)';
    e.currentTarget.style.borderColor = '#0066cc';
}

/**
 * Handle drag leave event
 */
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.style.backgroundColor = '';
    e.currentTarget.style.borderColor = '';
}

/**
 * Handle drop event
 */
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const fileInput = document.getElementById('file');
        fileInput.files = files;
        fileInput.dispatchEvent(new Event('change'));
    }
    
    e.currentTarget.style.backgroundColor = '';
    e.currentTarget.style.borderColor = '';
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    const form = document.querySelector('form[action*="upload"]');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            return false;
        }
        
        // Show loading state
        showProcessingState();
    });
}

/**
 * Validate form before submission
 */
function validateForm() {
    const fileInput = document.getElementById('file');
    const scaleInput = document.getElementById('scale_factor');
    const elevationInput = document.getElementById('elevation_range');
    
    // Check if file is selected
    if (!fileInput.files.length) {
        showAlert('Please select an image file to process.', 'error');
        fileInput.focus();
        return false;
    }
    
    // Validate scale factor
    const scaleValue = parseFloat(scaleInput.value);
    if (isNaN(scaleValue) || scaleValue < 0.1 || scaleValue > 10.0) {
        showAlert('Scale factor must be between 0.1 and 10.0.', 'error');
        scaleInput.focus();
        return false;
    }
    
    // Validate elevation range
    const elevationValue = parseFloat(elevationInput.value);
    if (isNaN(elevationValue) || elevationValue < 10 || elevationValue > 10000) {
        showAlert('Maximum elevation must be between 10 and 10,000 meters.', 'error');
        elevationInput.focus();
        return false;
    }
    
    return true;
}

/**
 * Show processing state
 */
function showProcessingState() {
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = `
            <i class="fas fa-spinner fa-spin me-2"></i>
            Processing DEM...
        `;
        
        // Add progress indicator
        showProcessingProgress();
    }
}

/**
 * Show processing progress
 */
function showProcessingProgress() {
    const progressHtml = `
        <div class="processing-status mt-4" id="processing-status">
            <div class="card mission-card">
                <div class="card-body text-center">
                    <h5><i class="fas fa-rocket me-2"></i>Processing Your Image</h5>
                    <p class="text-muted">Generating Digital Elevation Model using computer vision techniques...</p>
                    <div class="progress mb-3">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" 
                             role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
                        </div>
                    </div>
                    <p class="small text-muted">
                        <i class="fas fa-info-circle me-1"></i>
                        This may take a few moments depending on image size and complexity.
                    </p>
                </div>
            </div>
        </div>
    `;
    
    const form = document.querySelector('form[action*="upload"]');
    if (form && !document.getElementById('processing-status')) {
        form.insertAdjacentHTML('afterend', progressHtml);
    }
}

/**
 * Initialize parameter controls with real-time feedback
 */
function initializeParameterControls() {
    const scaleInput = document.getElementById('scale_factor');
    const smoothingSelect = document.getElementById('smoothing');
    const elevationInput = document.getElementById('elevation_range');
    
    if (scaleInput) {
        scaleInput.addEventListener('input', updateScaleDescription);
        updateScaleDescription.call(scaleInput);
    }
    
    if (smoothingSelect) {
        smoothingSelect.addEventListener('change', updateSmoothingDescription);
        updateSmoothingDescription.call(smoothingSelect);
    }
    
    if (elevationInput) {
        elevationInput.addEventListener('input', updateElevationDescription);
        updateElevationDescription.call(elevationInput);
    }
}

/**
 * Update scale factor description
 */
function updateScaleDescription() {
    const value = parseFloat(this.value);
    const helpText = this.parentElement.querySelector('.form-text');
    
    if (value < 0.5) {
        helpText.innerHTML = 'Elevation scaling multiplier - <strong>Conservative</strong> (reduces apparent elevation)';
    } else if (value <= 1.5) {
        helpText.innerHTML = 'Elevation scaling multiplier - <strong>Balanced</strong> (natural elevation range)';
    } else {
        helpText.innerHTML = 'Elevation scaling multiplier - <strong>Enhanced</strong> (amplifies elevation differences)';
    }
}

/**
 * Update smoothing description
 */
function updateSmoothingDescription() {
    const value = parseInt(this.value);
    const helpText = this.parentElement.querySelector('.form-text');
    const descriptions = {
        1: 'Noise reduction strength - <strong>Minimal</strong> (preserves fine details)',
        3: 'Noise reduction strength - <strong>Balanced</strong> (good for most images)',
        5: 'Noise reduction strength - <strong>Heavy</strong> (removes noise but may blur details)'
    };
    
    helpText.innerHTML = descriptions[value] || 'Noise reduction strength';
}

/**
 * Update elevation description
 */
function updateElevationDescription() {
    const value = parseFloat(this.value);
    const helpText = this.parentElement.querySelector('.form-text');
    
    if (value <= 100) {
        helpText.innerHTML = 'Maximum elevation value - <strong>Small features</strong> (rocks, craters)';
    } else if (value <= 1000) {
        helpText.innerHTML = 'Maximum elevation value - <strong>Medium terrain</strong> (hills, valleys)';
    } else {
        helpText.innerHTML = 'Maximum elevation value - <strong>Large terrain</strong> (mountains, major features)';
    }
}

/**
 * Show alert message
 */
function showAlert(message, type) {
    const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
    const iconClass = type === 'error' ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
    
    const alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <i class="${iconClass} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert:not(.alert-dismissible)');
    existingAlerts.forEach(alert => alert.remove());
    
    // Add new alert at the top of the container
    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('afterbegin', alertHtml);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alert = container.querySelector('.alert');
            if (alert) {
                alert.classList.remove('show');
                setTimeout(() => alert.remove(), 150);
            }
        }, 5000);
    }
}

/**
 * Add subtle animations to enhance user experience
 */
function addAnimations() {
    // Animate cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';
                entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all cards
    document.querySelectorAll('.mission-card').forEach(card => {
        observer.observe(card);
    });
    
    // Add hover effects to download items
    document.querySelectorAll('.download-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

/**
 * Print functionality enhancement
 */
function enhancePrintStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @media print {
            .btn, .alert, .footer-section { display: none !important; }
            .mission-card { border: 1px solid #000 !important; }
            body { background: white !important; color: black !important; }
            .card-header { background: #f8f9fa !important; color: black !important; }
        }
    `;
    document.head.appendChild(style);
}

// Initialize print styles
enhancePrintStyles();

// Global error handler for better user experience
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showAlert('An unexpected error occurred. Please refresh the page and try again.', 'error');
});

// Handle form submission errors
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rejection:', e.reason);
    showAlert('A processing error occurred. Please try again with a different image.', 'error');
});
