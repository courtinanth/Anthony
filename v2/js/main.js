/**
 * Main JavaScript - Consultant SEO Bordeaux
 * With graceful degradation for no-JS clients
 */

(function () {
  'use strict';

  // Remove no-js class when JS is available
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  /**
   * Mobile Menu Toggle
   */
  function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');

    if (!menuToggle || !navList) return;

    menuToggle.addEventListener('click', function () {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      navList.classList.toggle('active');

      // Animate hamburger
      menuToggle.classList.toggle('active');
    });

    // Close menu when clicking a link
    navList.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navList.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!menuToggle.contains(e.target) && !navList.contains(e.target)) {
        navList.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.classList.remove('active');
      }
    });
  }

  /**
   * Scroll Animations using Intersection Observer
   */
  function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');

    if (!fadeElements.length || !('IntersectionObserver' in window)) {
      // Fallback: show all elements immediately
      fadeElements.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /**
   * Smooth Scroll for anchor links
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /**
   * Form Validation
   */
  function initFormValidation() {
    const form = document.querySelector('.contact-form form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      let isValid = true;
      const requiredFields = form.querySelectorAll('[required]');

      requiredFields.forEach(function (field) {
        removeError(field);

        if (!field.value.trim()) {
          showError(field, 'Ce champ est requis');
          isValid = false;
        } else if (field.type === 'email' && !isValidEmail(field.value)) {
          showError(field, 'Veuillez entrer un email valide');
          isValid = false;
        }
      });

      if (!isValid) {
        e.preventDefault();
      }
    });

    // Real-time validation
    form.querySelectorAll('input, textarea').forEach(function (field) {
      field.addEventListener('blur', function () {
        removeError(field);

        if (field.hasAttribute('required') && !field.value.trim()) {
          showError(field, 'Ce champ est requis');
        } else if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
          showError(field, 'Veuillez entrer un email valide');
        }
      });
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(field, message) {
    field.style.borderColor = '#ef4444';

    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) return;

    const errorEl = document.createElement('span');
    errorEl.className = 'error-message';
    errorEl.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 0.25rem; display: block;';
    errorEl.textContent = message;
    field.parentNode.appendChild(errorEl);
  }

  function removeError(field) {
    field.style.borderColor = '';
    const errorEl = field.parentNode.querySelector('.error-message');
    if (errorEl) {
      errorEl.remove();
    }
  }

  /**
   * Header scroll effect
   */
  function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', function () {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.style.background = 'rgba(10, 10, 15, 0.95)';
      } else {
        header.style.background = 'rgba(10, 10, 15, 0.8)';
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  /**
   * Footer Dropdown Toggle
   */
  function initFooterDropdowns() {
    const dropdowns = document.querySelectorAll('.footer-dropdown-toggle');

    dropdowns.forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        const dropdown = toggle.parentElement;
        dropdown.classList.toggle('open');
      });
    });
  }

  /**
   * Initialize all modules
   */
  function init() {
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();
    initFormValidation();
    initHeaderScroll();
    initFooterDropdowns();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
