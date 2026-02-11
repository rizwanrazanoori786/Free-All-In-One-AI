/**
 * Hero Banner Slider with Multiple Animations
 * Auto-play with manual controls
 */

class HeroSlider {
    constructor(sliderElement) {
        this.slider = sliderElement;
        this.slides = this.slider.querySelectorAll('.hero-slide');
        this.dots = this.slider.querySelectorAll('.slider-dot');
        this.prevBtn = this.slider.querySelector('.slider-prev');
        this.nextBtn = this.slider.querySelector('.slider-next');
        this.currentSlide = 0;
        this.autoPlayInterval = null;
        this.isPlaying = true;

        this.init();
    }

    init() {
        // Set first slide as active
        if (this.slides.length > 0) {
            this.slides[0].classList.add('active');
            if (this.dots.length > 0) {
                this.dots[0].classList.add('active');
            }
        }

        // Add event listeners
        this.prevBtn?.addEventListener('click', () => this.prev());
        this.nextBtn?.addEventListener('click', () => this.next());

        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Start auto-play
        this.startAutoPlay();

        // Pause on hover
        this.slider.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.slider.addEventListener('mouseleave', () => this.startAutoPlay());

        // Touch support
        this.addTouchSupport();
    }

    goToSlide(index) {
        // Remove active from current slide
        this.slides[this.currentSlide].classList.remove('active');
        if (this.dots[this.currentSlide]) {
            this.dots[this.currentSlide].classList.remove('active');
        }

        // Set new slide as active
        this.currentSlide = index;
        this.slides[this.currentSlide].classList.add('active');
        if (this.dots[this.currentSlide]) {
            this.dots[this.currentSlide].classList.add('active');
        }
    }

    next() {
        const nextSlide = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextSlide);
    }

    prev() {
        const prevSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevSlide);
    }

    startAutoPlay() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.autoPlayInterval = setInterval(() => {
            this.next();
        }, 5000); // Change slide every 5 seconds
    }

    pauseAutoPlay() {
        this.isPlaying = false;
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    addTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;

        this.slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });

        const handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        };

        this.handleSwipe = handleSwipe;
    }
}

// Initialize hero slider when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    const heroSliderElement = document.querySelector('.hero-slider');
    if (heroSliderElement) {
        window.heroSlider = new HeroSlider(heroSliderElement);
    }
});

export default HeroSlider;
