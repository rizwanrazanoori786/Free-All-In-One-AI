/**
 * Free All In One AI - Main JavaScript
 * Core functionality for navigation, sidebar, and interactions
 */

// ========================================
// DOM Ready Handler
// ========================================
document.addEventListener('DOMContentLoaded', function () {

  // ========================================
  // Hamburger Menu & Sidebar Toggle
  // ========================================

  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function () {
      this.classList.toggle('active');
      sidebar.classList.toggle('active');
      if (sidebarOverlay) {
        sidebarOverlay.classList.toggle('active');
      }
    });

    // Close sidebar when clicking overlay
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', function () {
        menuToggle.classList.remove('active');
        sidebar.classList.remove('active');
        this.classList.remove('active');
      });
    }
  }

  initializeApp();
});

// ========================================
// Initialize Application
// ========================================
function initializeApp() {
  initMobileMenu();
  initSidebar();
  initSmoothScroll();
  initStickyHeader();
  initLazyLoading();
  initScrollAnimations();
  initActiveNavigation();
}

// ========================================
// Mobile Menu Toggle
// ========================================
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', function () {
      navMenu.classList.toggle('active');

      // Animate hamburger icon
      const spans = menuToggle.querySelectorAll('span');
      if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translateY(8px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
      } else {
        spans.forEach(span => {
          span.style.transform = '';
          span.style.opacity = '';
        });
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
        const spans = menuToggle.querySelectorAll('span');
        spans.forEach(span => {
          span.style.transform = '';
          span.style.opacity = '';
        });
      }
    });

    // Close menu when clicking a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function () {
        navMenu.classList.remove('active');
        const spans = menuToggle.querySelectorAll('span');
        spans.forEach(span => {
          span.style.transform = '';
          span.style.opacity = '';
        });
      });
    });
  }
}

// ========================================
// Sidebar Toggle (Mobile)
// ========================================
function initSidebar() {
  const sidebar = document.querySelector('.sidebar');

  if (!sidebar) return;

  // Create sidebar toggle button for mobile
  const sidebarToggle = document.createElement('button');
  sidebarToggle.className = 'sidebar-toggle btn-secondary';
  sidebarToggle.innerHTML = '☰ Tools';
  sidebarToggle.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000; display: none; padding: 12px 20px; border-radius: 50px; box-shadow: var(--shadow-lg);';

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';

  document.body.appendChild(sidebarToggle);
  document.body.appendChild(overlay);

  // Show toggle button on mobile
  function checkMobile() {
    if (window.innerWidth <= 768) {
      sidebarToggle.style.display = 'block';
    } else {
      sidebarToggle.style.display = 'none';
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    }
  }

  checkMobile();
  window.addEventListener('resize', checkMobile);

  // Toggle sidebar
  sidebarToggle.addEventListener('click', function () {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  });

  // Close sidebar when clicking overlay
  overlay.addEventListener('click', function () {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
  });
}

// ========================================
// Smooth Scroll
// ========================================
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Skip if it's just "#"
      if (href === '#') {
        e.preventDefault();
        return;
      }

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ========================================
// Sticky Header on Scroll
// ========================================
function initStickyHeader() {
  const header = document.querySelector('header');

  if (!header) return;

  let lastScroll = 0;

  window.addEventListener('scroll', function () {
    const currentScroll = window.pageYOffset;

    // Add scrolled class for styling
    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

// ========================================
// Lazy Loading Images
// ========================================
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

// ========================================
// Scroll Animations
// ========================================
function initScrollAnimations() {
  const elements = document.querySelectorAll('.scroll-animate, .scroll-animate-stagger');

  if (!elements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
  } else {
    // Fallback: just add visible class
    elements.forEach(el => el.classList.add('visible'));
  }
}

// ========================================
// Active Navigation Highlighting
// ========================================
function initActiveNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu a, .sidebar-menu a');

  if (!sections.length || !navLinks.length) return;

  function highlightNavigation() {
    let current = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (window.pageYOffset >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', highlightNavigation);
  highlightNavigation(); // Call once on load
}

// ========================================
// Form Validation Helper
// ========================================
function validateForm(formElement) {
  const inputs = formElement.querySelectorAll('input[required], textarea[required]');
  let isValid = true;

  inputs.forEach(input => {
    if (!input.value.trim()) {
      isValid = false;
      input.classList.add('error');

      // Add error message if not exists
      if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-message')) {
        const errorMsg = document.createElement('span');
        errorMsg.className = 'error-message';
        errorMsg.style.color = 'var(--danger-color)';
        errorMsg.style.fontSize = '0.875rem';
        errorMsg.style.marginTop = '4px';
        errorMsg.style.display = 'block';
        errorMsg.textContent = 'This field is required';
        input.parentNode.insertBefore(errorMsg, input.nextSibling);
      }
    } else {
      input.classList.remove('error');
      const errorMsg = input.nextElementSibling;
      if (errorMsg && errorMsg.classList.contains('error-message')) {
        errorMsg.remove();
      }
    }
  });

  return isValid;
}

// ========================================
// Show Toast Notification
// ========================================
function showToast(message, type = 'info') {
  // Create toast container if not exists
  let toastContainer = document.querySelector('.toast-container');

  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
    document.body.appendChild(toastContainer);
  }

  // Create toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} toast-enter`;
  toast.style.cssText = `
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-md);
    padding: var(--spacing-sm) var(--spacing-md);
    color: var(--text-primary);
    box-shadow: var(--shadow-lg);
    min-width: 250px;
    max-width: 400px;
  `;

  // Add color based on type
  const colors = {
    success: 'var(--success-color)',
    error: 'var(--danger-color)',
    warning: 'var(--warning-color)',
    info: 'var(--accent-color)'
  };

  toast.style.borderLeftColor = colors[type] || colors.info;
  toast.style.borderLeftWidth = '4px';

  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-exit');
    setTimeout(() => {
      toast.remove();

      // Remove container if empty
      if (toastContainer.children.length === 0) {
        toastContainer.remove();
      }
    }, 400);
  }, 3000);
}

// ========================================
// Loading Spinner Helper
// ========================================
function showLoading(element) {
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  spinner.style.margin = '20px auto';

  if (element) {
    element.innerHTML = '';
    element.appendChild(spinner);
  }

  return spinner;
}

function hideLoading(element) {
  if (element) {
    const spinner = element.querySelector('.spinner');
    if (spinner) {
      spinner.remove();
    }
  }
}

// ========================================
// Export functions for use in other scripts
// ========================================
window.appUtils = {
  validateForm,
  showToast,
  showLoading,
  hideLoading
};
