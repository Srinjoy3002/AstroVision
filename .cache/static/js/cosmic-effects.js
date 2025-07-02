/**
 * AstroVision - Cosmic Effects and Interactive Elements
 * Enhanced space-themed animations and microinteractions
 */

class CosmicEffects {
    constructor() {
        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        this.animationFrame = null;
        this.splashShown = false;
        
        this.init();
    }
    
    init() {
        this.showSplashScreen();
        this.createStarField();
        this.initializeMouseTracking();
        this.initializeScrollEffects();
        this.initializeHoverEffects();
        this.createFloatingElements();
        this.initializeCosmicCursor();
    }
    
    showSplashScreen() {
        const splashScreen = document.getElementById('splash-screen');
        if (!splashScreen) {
            // If no splash screen, just initialize main animations
            this.splashShown = true;
            this.initializeMainAnimations();
            return;
        }
        
        // Play cosmic sound effect (if audio is enabled)
        this.playCosmicSound();
        
        // Animate splash elements
        setTimeout(() => {
            const titleWords = document.querySelectorAll('.title-word');
            titleWords.forEach((word, index) => {
                setTimeout(() => {
                    word.style.animation = 'slideInGlow 1s ease-out forwards';
                }, index * 500);
            });
        }, 500);
        
        // Hide splash screen after animation
        setTimeout(() => {
            splashScreen.style.animation = 'fadeOut 1s ease-in-out forwards';
            this.splashShown = true;
            this.initializeMainAnimations();
        }, 4000);
    }
    
    playCosmicSound() {
        // Create a subtle cosmic ambient sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create a subtle space ambient sound
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(60, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 2);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.5);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 3);
            
            oscillator.type = 'sine';
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 3);
        } catch (error) {
            // Gracefully handle browsers that don't support Web Audio API
            console.log('Web Audio API not supported');
        }
    }
    
    createStarField() {
        const starField = document.createElement('div');
        starField.className = 'star-field';
        starField.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -2;
        `;
        
        document.body.appendChild(starField);
        
        // Create animated stars
        for (let i = 0; i < 50; i++) {
            this.createStar(starField);
        }
    }
    
    createStar(container) {
        const star = document.createElement('div');
        star.className = 'cosmic-star';
        
        const size = Math.random() * 3 + 1;
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;
        
        star.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            animation: starTwinkle ${duration}s ease-in-out ${delay}s infinite alternate;
        `;
        
        container.appendChild(star);
        
        // Add CSS for star twinkling if not already added
        if (!document.querySelector('#star-animation-style')) {
            const style = document.createElement('style');
            style.id = 'star-animation-style';
            style.textContent = `
                @keyframes starTwinkle {
                    0% { opacity: 0.3; transform: scale(1); }
                    100% { opacity: 1; transform: scale(1.2); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    initializeMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            
            // Create trailing particles on mouse movement
            if (Math.random() < 0.1) {
                this.createMouseParticle(e.clientX, e.clientY);
            }
        });
    }
    
    createMouseParticle(x, y) {
        const particle = document.createElement('div');
        particle.className = 'mouse-particle';
        
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: rgba(0, 212, 255, 0.6);
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 1000;
            animation: particleFade 1s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
        
        // Add CSS for particle animation if not already added
        if (!document.querySelector('#particle-animation-style')) {
            const style = document.createElement('style');
            style.id = 'particle-animation-style';
            style.textContent = `
                @keyframes particleFade {
                    0% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0) translateY(-20px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    initializeScrollEffects() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideInUp 0.8s ease-out forwards';
                }
            });
        }, { threshold: 0.1 });
        
        // Observe all cosmic cards and info cards
        document.querySelectorAll('.cosmic-card, .info-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            observer.observe(card);
        });
        
        // Add CSS for slide in animation
        if (!document.querySelector('#scroll-animation-style')) {
            const style = document.createElement('style');
            style.id = 'scroll-animation-style';
            style.textContent = `
                @keyframes slideInUp {
                    0% {
                        opacity: 0;
                        transform: translateY(50px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    initializeHoverEffects() {
        // Enhanced hover effects for interactive elements
        document.querySelectorAll('.cosmic-card, .info-card, .parameter-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.createHoverParticles(card);
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // Special effects for buttons
        document.querySelectorAll('.btn-cosmic, .btn-launch').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                this.createButtonGlow(btn);
            });
            
            btn.addEventListener('click', () => {
                this.createClickRipple(btn, event);
            });
        });
    }
    
    createHoverParticles(element) {
        const rect = element.getBoundingClientRect();
        const particleCount = 5;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'hover-particle';
                
                const x = rect.left + Math.random() * rect.width;
                const y = rect.top + Math.random() * rect.height;
                
                particle.style.cssText = `
                    position: fixed;
                    width: 3px;
                    height: 3px;
                    background: rgba(0, 255, 136, 0.8);
                    border-radius: 50%;
                    left: ${x}px;
                    top: ${y}px;
                    pointer-events: none;
                    z-index: 1000;
                    animation: hoverParticleFloat 2s ease-out forwards;
                `;
                
                document.body.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 2000);
            }, i * 100);
        }
        
        // Add CSS for hover particle animation
        if (!document.querySelector('#hover-particle-style')) {
            const style = document.createElement('style');
            style.id = 'hover-particle-style';
            style.textContent = `
                @keyframes hoverParticleFloat {
                    0% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-30px) scale(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    createButtonGlow(button) {
        const glow = document.createElement('div');
        glow.className = 'button-glow';
        
        glow.style.cssText = `
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #00d4ff, #b000ff, #00ff88, #00d4ff);
            border-radius: 50px;
            z-index: -1;
            opacity: 0;
            animation: glowPulse 0.5s ease-out forwards;
        `;
        
        button.style.position = 'relative';
        button.appendChild(glow);
        
        setTimeout(() => {
            if (glow.parentNode) {
                glow.parentNode.removeChild(glow);
            }
        }, 500);
        
        // Add CSS for glow animation
        if (!document.querySelector('#glow-animation-style')) {
            const style = document.createElement('style');
            style.id = 'glow-animation-style';
            style.textContent = `
                @keyframes glowPulse {
                    0% { opacity: 0; }
                    50% { opacity: 0.7; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    createClickRipple(button, event) {
        const ripple = document.createElement('div');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            left: ${x}px;
            top: ${y}px;
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out forwards;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
        
        // Add CSS for ripple animation
        if (!document.querySelector('#ripple-animation-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation-style';
            style.textContent = `
                @keyframes rippleEffect {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    createFloatingElements() {
        // Create floating cosmic elements
        const elementTypes = ['🌟', '✨', '🚀', '🛸', '⭐'];
        
        setInterval(() => {
            if (Math.random() < 0.3) {
                this.createFloatingElement(elementTypes[Math.floor(Math.random() * elementTypes.length)]);
            }
        }, 3000);
    }
    
    createFloatingElement(symbol) {
        const element = document.createElement('div');
        element.className = 'floating-cosmic-element';
        element.textContent = symbol;
        
        const startX = Math.random() * window.innerWidth;
        const endX = startX + (Math.random() - 0.5) * 200;
        const duration = Math.random() * 10 + 15;
        
        element.style.cssText = `
            position: fixed;
            left: ${startX}px;
            bottom: -50px;
            font-size: 1.5rem;
            pointer-events: none;
            z-index: -1;
            opacity: 0.6;
            animation: floatUp ${duration}s linear forwards;
        `;
        
        document.body.appendChild(element);
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, duration * 1000);
        
        // Add CSS for floating animation
        if (!document.querySelector('#float-animation-style')) {
            const style = document.createElement('style');
            style.id = 'float-animation-style';
            style.textContent = `
                @keyframes floatUp {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0.6;
                    }
                    50% {
                        opacity: 0.8;
                    }
                    100% {
                        transform: translateY(-100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    initializeCosmicCursor() {
        // Create custom cosmic cursor trail
        const cursor = document.createElement('div');
        cursor.className = 'cosmic-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(0, 212, 255, 0.5);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
            mix-blend-mode: difference;
            transition: all 0.1s ease;
        `;
        
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = (e.clientX - 10) + 'px';
            cursor.style.top = (e.clientY - 10) + 'px';
        });
        
        // Change cursor on interactive elements
        document.querySelectorAll('button, a, input, select, .upload-zone').forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                cursor.style.borderColor = 'rgba(176, 0, 255, 0.8)';
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.borderColor = 'rgba(0, 212, 255, 0.5)';
            });
        });
    }
    
    initializeMainAnimations() {
        // Start main page animations after splash screen
        this.animateNavigationEntrance();
        this.animateHeroElements();
        this.startParticleSystem();
    }
    
    animateNavigationEntrance() {
        const nav = document.querySelector('.cosmic-nav');
        if (nav) {
            nav.style.transform = 'translateY(-100px)';
            nav.style.opacity = '0';
            
            setTimeout(() => {
                nav.style.transition = 'all 1s ease-out';
                nav.style.transform = 'translateY(0)';
                nav.style.opacity = '1';
            }, 500);
        }
    }
    
    animateHeroElements() {
        const heroElements = document.querySelectorAll('.hero-title, .hero-description, .hero-actions');
        heroElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                element.style.transition = 'all 1s ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, 1000 + (index * 300));
        });
    }
    
    startParticleSystem() {
        // Advanced particle system for background ambiance
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -3;
        `;
        
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const particles = [];
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        
        // Create particles
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
        
        const animateParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((particle, index) => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 212, 255, ${particle.opacity})`;
                ctx.fill();
                
                // Connect nearby particles
                particles.forEach((otherParticle, otherIndex) => {
                    if (index !== otherIndex) {
                        const dx = particle.x - otherParticle.x;
                        const dy = particle.y - otherParticle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < 100) {
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(otherParticle.x, otherParticle.y);
                            ctx.strokeStyle = `rgba(0, 212, 255, ${0.1 * (1 - distance / 100)})`;
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }
                    }
                });
            });
            
            requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
    }
}

// Enhanced File Upload Functionality
function initializeFileUpload() {
    const uploadZone = document.getElementById('upload-zone') || document.querySelector('.upload-zone');
    const fileInput = document.getElementById('file');
    
    if (!uploadZone || !fileInput) return;
    
    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.add('dragover');
            createDragEffect();
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.remove('dragover');
        });
    });
    
    uploadZone.addEventListener('drop', handleDrop);
    uploadZone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileSelect);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }
    
    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            displayFilePreview(file);
            fileInput.files = files;
        }
    }
    
    function displayFilePreview(file) {
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        preview.innerHTML = `
            <div class="preview-content">
                <i class="fas fa-image"></i>
                <div class="preview-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
                <div class="preview-status">
                    <i class="fas fa-check-circle text-success"></i>
                </div>
            </div>
        `;
        
        preview.style.cssText = `
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid rgba(0, 255, 136, 0.3);
            border-radius: 10px;
            padding: 1rem;
            margin-top: 1rem;
            animation: slideInPreview 0.5s ease-out forwards;
        `;
        
        // Remove existing preview
        const existingPreview = uploadZone.querySelector('.file-preview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        uploadZone.appendChild(preview);
        
        // Add CSS for preview animation
        if (!document.querySelector('#preview-animation-style')) {
            const style = document.createElement('style');
            style.id = 'preview-animation-style';
            style.textContent = `
                @keyframes slideInPreview {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .preview-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    color: white;
                }
                .preview-info {
                    flex: 1;
                }
                .file-name {
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }
                .file-size {
                    font-size: 0.9rem;
                    opacity: 0.8;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function createDragEffect() {
        // Create visual feedback for drag operations
        const effect = document.createElement('div');
        effect.className = 'drag-effect';
        effect.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle, rgba(0, 255, 136, 0.2) 0%, transparent 70%);
            border-radius: 15px;
            pointer-events: none;
            animation: dragPulse 1s ease-in-out infinite;
        `;
        
        uploadZone.style.position = 'relative';
        uploadZone.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 1000);
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

function initializeParameterTooltips() {
    const parameters = document.querySelectorAll('.parameter-card');
    
    parameters.forEach(param => {
        param.addEventListener('mouseenter', () => {
            showParameterTooltip(param);
        });
        
        param.addEventListener('mouseleave', () => {
            hideParameterTooltip();
        });
    });
}

function showParameterTooltip(element) {
    const tooltip = document.createElement('div');
    tooltip.className = 'parameter-tooltip';
    
    const paramType = element.querySelector('i').className;
    let tooltipText = '';
    
    if (paramType.includes('ruler-vertical')) {
        tooltipText = 'Scale Factor controls the height multiplier for elevation data. Higher values create more dramatic terrain.';
    } else if (paramType.includes('adjust')) {
        tooltipText = 'Smoothing Level reduces noise in the elevation model. Higher values create smoother terrain.';
    } else if (paramType.includes('mountain')) {
        tooltipText = 'Max Elevation sets the maximum height value in meters for the generated terrain model.';
    }
    
    tooltip.innerHTML = `
        <div class="tooltip-content">
            ${tooltipText}
        </div>
    `;
    
    tooltip.style.cssText = `
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 0.75rem;
        border-radius: 8px;
        font-size: 0.9rem;
        max-width: 200px;
        z-index: 1000;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: 0.5rem;
        opacity: 0;
        animation: tooltipFadeIn 0.3s ease-out forwards;
    `;
    
    tooltip.id = 'parameter-tooltip';
    element.style.position = 'relative';
    element.appendChild(tooltip);
    
    // Add CSS for tooltip animation
    if (!document.querySelector('#tooltip-animation-style')) {
        const style = document.createElement('style');
        style.id = 'tooltip-animation-style';
        style.textContent = `
            @keyframes tooltipFadeIn {
                0% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(10px);
                }
                100% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function hideParameterTooltip() {
    const tooltip = document.getElementById('parameter-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Initialize cosmic effects when DOM is loaded
function initializeCosmicEffects() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new CosmicEffects();
        });
    } else {
        new CosmicEffects();
    }
}

// Export for global access
window.initializeCosmicEffects = initializeCosmicEffects;
window.initializeFileUpload = initializeFileUpload;
window.initializeParameterTooltips = initializeParameterTooltips;