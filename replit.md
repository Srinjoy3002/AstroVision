# Planetary DEM Converter

## Overview

The Planetary DEM Converter is a Flask-based web application that converts 2D planetary surface images into Digital Elevation Models (DEMs) for space exploration analysis. The application uses height-from-shading techniques to generate 3D terrain data from flat images, making it useful for analyzing planetary surfaces and topography.

## System Architecture

### Frontend Architecture
- **Framework**: HTML5 with Bootstrap 5.3.0 for responsive design
- **Styling**: Custom CSS with space exploration theme (dark background with blue/silver accents)
- **JavaScript**: Vanilla JavaScript for form validation, file upload handling, and UI interactions
- **Visualization**: Plotly.js for 3D visualization of generated DEM data

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **Database ORM**: SQLAlchemy with Flask-SQLAlchemy extension
- **File Handling**: Werkzeug utilities for secure file uploads
- **Image Processing**: OpenCV, PIL, NumPy, and SciPy for DEM generation
- **Session Management**: Flask sessions with configurable secret key

### Data Storage
- **Primary Database**: Configurable (defaults to SQLite, supports PostgreSQL via DATABASE_URL)
- **File Storage**: Local filesystem with separate upload and output directories
- **Session Storage**: Flask's built-in session management

## Key Components

### 1. Web Application (`app.py`)
- Flask application factory pattern
- Database configuration with connection pooling
- File upload configuration (16MB limit, image formats only)
- Route handling for upload and processing endpoints

### 2. DEM Processing Engine (`dem_processor.py`)
- **DEMProcessor Class**: Core image processing functionality
- **Height-from-Shading**: Converts grayscale intensity to elevation data
- **Configurable Parameters**: Scale factor, smoothing, elevation range
- **Output Formats**: Multiple file formats for different use cases

### 3. Data Models (`models.py`)
- **ProcessingJob Model**: Tracks processing jobs with status, parameters, and results
- **Job Lifecycle**: pending → processing → completed/failed
- **Metadata Storage**: Processing logs, output file paths, timestamps

### 4. User Interface
- **Upload Interface**: Drag-and-drop file upload with parameter controls
- **Results Display**: Processing summary and downloadable outputs
- **Responsive Design**: Mobile-friendly interface with space theme

## Data Flow

1. **Image Upload**: User uploads planetary surface image through web interface
2. **Job Creation**: System creates ProcessingJob record with unique ID
3. **Parameter Configuration**: User sets scale factor, smoothing, and elevation range
4. **Image Processing**: DEMProcessor converts 2D image to elevation model
5. **Result Generation**: Multiple output formats generated (heightmap, 3D model, etc.)
6. **Status Updates**: Job status updated throughout processing pipeline
7. **Result Delivery**: User can download processed files and view results

## External Dependencies

### Python Libraries
- **Flask**: Web framework and routing
- **SQLAlchemy**: Database ORM and migrations
- **OpenCV**: Computer vision and image processing
- **PIL/Pillow**: Image manipulation and format handling
- **NumPy**: Numerical computations for elevation calculations
- **SciPy**: Scientific computing for interpolation and filtering
- **Plotly**: Interactive 3D visualization generation

### Frontend Libraries
- **Bootstrap 5.3.0**: CSS framework for responsive design
- **Font Awesome 6.4.0**: Icon library for UI elements
- **Plotly.js**: Client-side 3D plotting and visualization

### Infrastructure
- **Database**: SQLite (default) or PostgreSQL (production)
- **File System**: Local storage for uploads and outputs
- **Session Management**: Flask's secure cookie-based sessions

## Deployment Strategy

### Environment Configuration
- **DATABASE_URL**: Database connection string (supports PostgreSQL)
- **SESSION_SECRET**: Secure session key for production
- **File Directories**: Automatic creation of upload/output folders

### Production Considerations
- **Proxy Support**: ProxyFix middleware for reverse proxy deployments
- **Database Pooling**: Connection pool with recycling and health checks
- **File Size Limits**: 16MB upload limit with validation
- **Error Handling**: Comprehensive logging and error reporting

### Scalability Features
- **Stateless Processing**: Each job is self-contained
- **Configurable Storage**: Database and file storage can be externalized
- **Session Management**: Supports load balancing with proper session handling

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### July 01, 2025 - AstroVision Space Theme Implementation
- **Complete UI/UX Overhaul**: Transformed the application from "Planetary DEM Converter" to "AstroVision - Let's Make a Space Trip"
- **Animated Splash Screen**: Added cinematic splash screen with tagline, planet animations, and loading sequence
- **Enhanced Space Visuals**: Implemented cosmic backgrounds, nebula effects, animated starfields, and floating planets
- **Advanced CSS Framework**: Created comprehensive `astrovision.css` with neon accents (blue, purple, cosmic green), glass morphism effects, and 20+ custom animations
- **Interactive Microinteractions**: Added hover effects, particle systems, cosmic cursor trails, floating elements, and button animations
- **Template Restructuring**: Implemented base template system with proper template inheritance
- **Cosmic Navigation**: Enhanced navigation with rocket animations and glowing hover effects
- **Enhanced Upload Interface**: Redesigned file upload with animated planetary rings and drag-and-drop cosmic effects
- **Futuristic Results Page**: Completely redesigned results display with mission completion celebration and enhanced download cards

### Technical Architecture Updates
- **Frontend**: Now uses advanced CSS Grid/Flexbox layouts with cosmic theme
- **Animations**: Implemented 15+ CSS keyframe animations for planetary objects, particles, and UI elements
- **JavaScript**: Added `cosmic-effects.js` with particle systems, ambient sound effects, and interactive animations
- **Typography**: Integrated Orbitron and Exo 2 fonts for futuristic appearance
- **Color Palette**: Implemented cosmic variables with neon blue (#00d4ff), neon purple (#b000ff), and cosmic green (#00ff88)

## Changelog

Changelog:
- July 01, 2025: Updated 3D visualization with AstroVision cosmic color scheme and dark space theme
- July 01, 2025: Added futuristic launch sound with synchronized visual effects
- July 01, 2025: Complete AstroVision space theme implementation with animated splash screen and enhanced cosmic visuals  
- July 01, 2025: Initial setup