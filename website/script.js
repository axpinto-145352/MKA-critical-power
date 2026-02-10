/* =========================================================
   MKA Critical Power — Site JavaScript
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar scroll effect ---
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // --- Mobile navigation toggle ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        // Close mobile nav on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = navbar.offsetHeight + 16;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // --- Intersection Observer: Fade-in on scroll ---
    const fadeTargets = document.querySelectorAll(
        '.service-card, .metric-card, .eco-stage, .eco-arrow, .about-content, .about-visual, .cta-content, .section-header'
    );

    fadeTargets.forEach(el => el.classList.add('fade-up'));

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        fadeTargets.forEach(el => observer.observe(el));
    } else {
        // Fallback: show everything immediately
        fadeTargets.forEach(el => el.classList.add('visible'));
    }

    // --- Animated metric counters ---
    const metricNumbers = document.querySelectorAll('.metric-number');

    if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        metricNumbers.forEach(el => counterObserver.observe(el));
    }

    function animateCounter(el) {
        const finalText = el.textContent;
        const target = parseInt(el.dataset.target, 10);
        if (isNaN(target)) return;

        const duration = 1500;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);

            // Preserve the formatting of the original text
            if (finalText.startsWith('$')) {
                el.textContent = '$' + current + finalText.replace(/^\$[\d,]+/, '').replace(/^\d+/, '');
            } else {
                el.textContent = current + finalText.replace(/^\d+/, '');
            }

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = finalText;
            }
        }

        requestAnimationFrame(tick);
    }
});
