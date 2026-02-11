/**
 * Free All In One AI - Hero Slider
 * Auto-sliding carousel for homepage hero section
 */

// ========================================
// Slider Configuration
// ========================================
const SLIDER_CONFIG = {
    autoPlayInterval: 5000, // 5 seconds
    transitionDuration: 1000, // 1 second
    pauseOnHover: true
};

// ========================================
// Hero Slider Class
// ========================================
class HeroSlider {
    constructor(sliderElement) {
        this.slider = sliderElement;
        this.slides = this.slider.querySelectorAll('.slide');
        this.currentSlide = 0;
        this.isPlaying = true;
        this.autoPlayTimer = null;

        if (this.slides.length === 0) {
            console.warn('No slides found in hero slider');
            return;
        }

        this.init();
    }

    init() {
        // Show first slide
        this.slides[0].classList.add('active');

        // Create controls
        this.createControls();

        // Start autoplay
        this.startAutoPlay();

        // Pause on hover
        if (SLIDER_CONFIG.pauseOnHover) {
            this.slider.addEventListener('mouseenter', () => this.pauseAutoPlay());
            this.slider.addEventListener('mouseleave', () => this.startAutoPlay());
        }

        // Keyboard navigation
        this.initKeyboardNavigation();

        // Touch/Swipe support
        this.initTouchSupport();
    }

    createControls() {
        // Create dots container
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'slider-controls';

        // Create dots
        this.slides.forEach((slide, index) => {
            const dot = document.createElement('button');
            dot.className = 'slider-dot';
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);

            if (index === 0) {
                dot.classList.add('active');
            }

            dot.addEventListener('click', () => {
                this.goToSlide(index);
                this.pauseAutoPlay();
                this.startAutoPlay(); // Restart autoplay after manual navigation
            });

            dotsContainer.appendChild(dot);
        });

        this.slider.appendChild(dotsContainer);
        this.dots = dotsContainer.querySelectorAll('.slider-dot');
    }

    goToSlide(index) {
        // Remove active class from current slide and dot
        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');

        // Update current slide
        this.currentSlide = index;

        // Add active class to new slide and dot
        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }

    startAutoPlay() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.autoPlayTimer = setInterval(() => {
            this.nextSlide();
        }, SLIDER_CONFIG.autoPlayInterval);
    }

    pauseAutoPlay() {
        this.isPlaying = false;
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only respond if slider is in viewport
            const rect = this.slider.getBoundingClientRect();
            const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

            if (!isVisible) return;

            if (e.key === 'ArrowLeft') {
                this.prevSlide();
                this.pauseAutoPlay();
                this.startAutoPlay();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
                this.pauseAutoPlay();
                this.startAutoPlay();
            }
        });
    }

    initTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;

        this.slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);

        this.slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, false);

        const handleSwipe = () => {
            const swipeThreshold = 50;

            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left - next slide
                this.nextSlide();
                this.pauseAutoPlay();
                this.startAutoPlay();
            }

            if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right - previous slide
                this.prevSlide();
                this.pauseAutoPlay();
                this.startAutoPlay();
            }
        };

        this.handleSwipe = handleSwipe;
    }

    destroy() {
        this.pauseAutoPlay();
        // Remove event listeners if needed
    }
}

// ========================================
// Initialize Slider on DOM Ready
// ========================================
document.addEventListener('DOMContentLoaded', function () {
    const heroSlider = document.querySelector('.hero-slider');

    if (heroSlider) {
        window.sliderInstance = new HeroSlider(heroSlider);
    }
});

// ========================================
// Pause slider when page is not visible
// ========================================
document.addEventListener('visibilitychange', function () {
    if (window.sliderInstance) {
        if (document.hidden) {
            window.sliderInstance.pauseAutoPlay();
        } else {
            window.sliderInstance.startAutoPlay();
        }
    }
});
