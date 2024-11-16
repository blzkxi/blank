// Export the Slideshow class
export class Slideshow {
            constructor(container, options = {}) {
                this.container = typeof container === 'string' ? 
                    document.querySelector(container) : container;
                
                this.slides = Array.from(this.container.querySelectorAll('.slide'));
                this.currentIndex = 0;
                
                // Parse base timing from CSS
                const defaultStyles = getComputedStyle(this.slides[0]);
                this.baseDuration = parseInt(defaultStyles.getPropertyValue('--slide-duration')) || 2500;
                this.fadeOutDuration = parseInt(defaultStyles.getPropertyValue('--fade-duration')) || 800;
                
                // Core settings
                this.options = {
                    autoPlay: options.autoPlay !== undefined ? options.autoPlay : true,
                    onComplete: options.onComplete || (() => this.hideSlideshow())
                };

                this.isPlaying = false;
                this.interval = null;

                this.init();
            }

            init() {
                // Set initial slide
                this.showSlide(0);
                
                // Start if autoplay is enabled
                if (this.options.autoPlay) {
                    this.play();
                }
            }

            showSlide(index) {
                // Remove active class from current slide
                if (this.currentIndex >= 0) {
                    this.slides[this.currentIndex].classList.remove('active');
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
                currentSlide.classList.add('active');
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
                    this.container.classList.add('hidden');
                    if (this.options.onComplete) {
                        this.options.onComplete();
                    }
                }, this.fadeOutDuration);
            }

}