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
        // Remove active class from current slide
        if (this.currentIndex >= 0) {
            this.slides[this.currentIndex].classList.remove(this.config.activeClass);
        }
        
        // Update index and show new slide
        this.currentIndex = index;
        const currentSlide = this.slides[this.currentIndex];
        
        // Apply effect if specified
        const effect = currentSlide.dataset.effect;
        if (effect) {
            currentSlide.classList.add(`effect-${effect}`);
        }
        
        // Show slide
        currentSlide.classList.add(this.config.activeClass);

        // Trigger callback
        if (this.callbacks.onSlideChange) {
            this.callbacks.onSlideChange(this.currentIndex, currentSlide);
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

}