// Export the Slideshow class
export class Slideshow {
    // Add static default configuration 
    static defaults = {
        autoPlay: true,
        baseDuration: 2500,
        fadeOutDuration: 800,
        slideSelector: '.slide',
        activeClass: 'active',
        hiddenClass: 'hidden'
    };

    constructor(container, options = {}) {
        // Merge user options with defaults
        this.config = { ...Slideshow.defaults, ...options };
        
        this.container = typeof container === 'string' ? 
            document.querySelector(container) : container;
        
        this.slides = Array.from(this.container.querySelectorAll(this.config.slideSelector));
        this.currentIndex = 0;
        
        // Parse timing from CSS or use defaults
        const defaultStyles = getComputedStyle(this.slides[0]);
        this.baseDuration = parseInt(defaultStyles.getPropertyValue('--slide-duration')) || 
            this.config.baseDuration;
        this.fadeOutDuration = parseInt(defaultStyles.getPropertyValue('--fade-duration')) || 
            this.config.fadeOutDuration;
        
        // Event callbacks
        this.callbacks = {
            onSlideChange: options.onSlideChange,
            onComplete: options.onComplete || (() => this.hideSlideshow()),
            onPlay: options.onPlay,
            onPause: options.onPause
        };

        this.isPlaying = false;
        this.interval = null;

        this.init();
    }

    // Add public API methods
    getCurrentSlide() {
        return this.slides[this.currentIndex];
    }

    getTotalSlides() {
        return this.slides.length;
    }

    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.showSlide(index);
            return true;
        }
        return false;
    }

    next() {
        if (this.currentIndex < this.slides.length - 1) {
            this.showSlide(this.currentIndex + 1);
            return true;
        }
        return false;
    }

    previous() {
        if (this.currentIndex > 0) {
            this.showSlide(this.currentIndex - 1);
            return true;
        }
        return false;
    }

    init() {
        // Set initial slide
        this.showSlide(0);
        
        // Start if autoplay is enabled
        if (this.config.autoPlay) {
            this.play();
        }
    }

    showSlide(index) {
        // Remove active class and effects from current slide
        if (this.currentIndex >= 0) {
            const currentSlide = this.slides[this.currentIndex];
            currentSlide.classList.remove(this.config.activeClass);
            currentSlide.classList.remove('glitch-out');
            
            // Fade out current slide text
            const currentText = currentSlide.querySelector('.slide-text');
            if (currentText) {
                currentText.style.opacity = '0';
                currentText.style.transition = 'opacity 0.3s ease-out';
            }
        }
        
        // Update index and show new slide
        this.currentIndex = index;
        const nextSlide = this.slides[this.currentIndex];
        
        // Apply glitch effect
        nextSlide.classList.add('glitch-in');
        nextSlide.classList.add(this.config.activeClass);
        
        // Handle text fade in
        const nextText = nextSlide.querySelector('.slide-text');
        if (nextText) {
            // Reset initial state
            nextText.style.opacity = '0';
            nextText.style.transition = 'none';
            
            // Trigger fade in after a short delay (allows for glitch effect to start)
            setTimeout(() => {
                nextText.style.transition = 'opacity 0.8s ease-in';
                nextText.style.opacity = '1';
            }, 100);
        }
        
        // Remove glitch-in class after animation completes
        setTimeout(() => {
            nextSlide.classList.remove('glitch-in');
        }, 500);

        // Trigger callback
        if (this.callbacks.onSlideChange) {
            this.callbacks.onSlideChange(this.currentIndex, nextSlide);
        }
    }

    play() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.interval = setInterval(() => {
            if (this.currentIndex >= this.slides.length - 1) {
                this.pause();
                this.hideSlideshow();
                return;
            }
            this.showSlide(this.currentIndex + 1);
        }, this.baseDuration);
    }

    pause() {
        this.isPlaying = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    hideSlideshow() {
        setTimeout(() => {
            this.container.classList.add(this.config.hiddenClass);
            if (this.callbacks.onComplete) {
                this.callbacks.onComplete();
            }
        }, this.fadeOutDuration);
    }

    // Add Glitch Effect System
    createGlitchFilter() {
        // Create SVG filters dynamically
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.display = 'none';
        svg.innerHTML = `
            <defs>
                <filter id="slideGlitch">
                    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" stitchTiles="stitch" result="noise"/>
                    <feColorMatrix in="noise" type="saturate" values="0" result="noiseGray"/>
                    <feColorMatrix in="noiseGray" type="matrix" values="
                        1 0 0 0 0
                        0 0 0 0 0
                        0 0 1 0 0
                        0 0 0 1 0
                    " result="noiseMix"/>
                    <feDisplacementMap in="SourceGraphic" in2="noiseMix" scale="30" result="displace"/>
                    <feOffset in="displace" dx="5" dy="0" result="shifted"/>
                    <feBlend in="shifted" in2="displace" mode="screen"/>
                    <feColorMatrix type="matrix" values="
                        1.5 0 0 0 0
                        0 1 0 0 0
                        0 0 1.5 0 0
                        0 0 0 1 0
                    "/>
                </filter>
            </defs>
        `;
        document.body.appendChild(svg);

        // Add glitch keyframes dynamically
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes glitchIn {
                0% {
                    opacity: 0;
                    transform: scale(1.1);
                    filter: url(#slideGlitch) brightness(2) contrast(2);
                    clip-path: inset(0 0 100% 0);
                }
                20% {
                    opacity: 0.3;
                    transform: scale(1.05);
                    filter: url(#slideGlitch) brightness(1.5) contrast(1.5);
                    clip-path: inset(20% -5% 40% 5%);
                }
                40% {
                    opacity: 0.6;
                    transform: scale(1.02);
                    filter: url(#slideGlitch) brightness(1.2) contrast(1.2);
                    clip-path: inset(60% 5% 10% -5%);
                }
                60% {
                    opacity: 0.8;
                    transform: scale(1.01);
                    filter: url(#slideGlitch) brightness(1.1) contrast(1.1);
                    clip-path: inset(10% -5% 70% 5%);
                }
                80% {
                    opacity: 0.9;
                    transform: scale(1.005);
                    filter: url(#slideGlitch) brightness(1.05) contrast(1.05);
                    clip-path: inset(30% 5% 30% -5%);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                    filter: none;
                    clip-path: inset(0 0 0 0);
                }
            }

            @keyframes glitchOut {
                0% {
                    opacity: 1;
                    transform: scale(1);
                    filter: none;
                    clip-path: inset(0 0 0 0);
                }
                20% {
                    opacity: 0.9;
                    transform: scale(1.02);
                    filter: url(#slideGlitch) brightness(1.5) contrast(1.5);
                    clip-path: inset(30% -5% 30% 5%);
                }
                40% {
                    opacity: 0.7;
                    transform: scale(1.05);
                    filter: url(#slideGlitch) brightness(2) contrast(2);
                    clip-path: inset(10% 5% 70% -5%);
                }
                60% {
                    opacity: 0.5;
                    transform: scale(1.07);
                    filter: url(#slideGlitch) brightness(2.5) contrast(2.5);
                    clip-path: inset(60% -5% 10% 5%);
                }
                80% {
                    opacity: 0.3;
                    transform: scale(1.1);
                    filter: url(#slideGlitch) brightness(3) contrast(3);
                    clip-path: inset(20% 5% 40% -5%);
                }
                100% {
                    opacity: 0;
                    transform: scale(1.15);
                    filter: url(#slideGlitch) brightness(4) contrast(4);
                    clip-path: inset(100% 0 0 0);
                }
            }

            .glitch-in {
                animation: glitchIn var(--glitch-duration) cubic-bezier(0.2, 0, 0.8, 1) both;
            }

            .glitch-out {
                animation: glitchOut var(--glitch-duration) cubic-bezier(0.2, 0, 0.8, 1) both;
            }

            .slide {
                will-change: transform, opacity, filter, clip-path;
            }
        `;
        document.head.appendChild(styleSheet);
    }

    applyGlitchEffect(element, type = 'in') {
        const intensity = element.dataset.glitchIntensity || 1;
        const duration = this.config.glitchEffects?.duration || 500;
        
        element.style.setProperty('--glitch-duration', `${duration}ms`);
        element.style.setProperty('--glitch-intensity', intensity);
        
        // Remove any existing glitch classes
        element.classList.remove('glitch-in', 'glitch-out');
        
        // Force browser reflow
        void element.offsetWidth;
        
        // Apply random glitch artifacts before animation
        this.applyRandomGlitchArtifacts(element);
        
        // Apply new glitch effect
        element.classList.add(`glitch-${type}`);
        
        // Clean up after animation
        setTimeout(() => {
            element.classList.remove(`glitch-${type}`);
            this.removeGlitchArtifacts(element);
        }, duration);
    }

    applyRandomGlitchArtifacts(element) {
        const intensity = parseFloat(element.dataset.glitchIntensity || 1);
        const artifacts = document.createElement('div');
        artifacts.className = 'glitch-artifacts';
        
        // Create 3 artifact layers
        for (let i = 0; i < 3; i++) {
            const layer = element.cloneNode(true);
            layer.style.position = 'absolute';
            layer.style.top = '0';
            layer.style.left = '0';
            layer.style.opacity = Math.random() * 0.1 * intensity;
            layer.style.transform = `translate(${(Math.random() - 0.5) * 10 * intensity}px, ${(Math.random() - 0.5) * 10 * intensity}px)`;
            layer.style.filter = `hue-rotate(${Math.random() * 360}deg) saturate(${2 + Math.random() * 3}) blur(${Math.random() * 2}px)`;
            artifacts.appendChild(layer);
        }
        
        element.appendChild(artifacts);
    }

    removeGlitchArtifacts(element) {
        const artifacts = element.querySelector('.glitch-artifacts');
        if (artifacts) {
            artifacts.remove();
        }
    }
}