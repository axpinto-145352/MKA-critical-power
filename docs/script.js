/* =========================================================
   MKA Critical Power — Site JavaScript
   Particle system, scroll animations, counters, interactions
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // --- Particle Canvas Background ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animId;
        let w, h;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }

        resize();
        window.addEventListener('resize', resize);

        const PARTICLE_COUNT = Math.min(60, Math.floor(window.innerWidth / 20));
        const CONNECT_DIST = 150;
        const BLUE = { r: 0, g: 102, b: 255 };

        function createParticle() {
            return {
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.1
            };
        }

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push(createParticle());
        }

        function drawParticles() {
            ctx.clearRect(0, 0, w, h);

            // Update and draw particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < 0) p.x = w;
                if (p.x > w) p.x = 0;
                if (p.y < 0) p.y = h;
                if (p.y > h) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${BLUE.r}, ${BLUE.g}, ${BLUE.b}, ${p.opacity})`;
                ctx.fill();
            }

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECT_DIST) {
                        const opacity = (1 - dist / CONNECT_DIST) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(${BLUE.r}, ${BLUE.g}, ${BLUE.b}, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animId = requestAnimationFrame(drawParticles);
        }

        // Only run particles when tab is visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animId);
            } else {
                drawParticles();
            }
        });

        drawParticles();
    }

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
        '.service-card, .metric-card, .eco-stage, .eco-arrow, .about-content, .about-visual, .cta-content, .section-header, .metrics-header, .proof-strip, .eco-buyers'
    );

    fadeTargets.forEach(el => el.classList.add('fade-up'));

    // --- Stagger children animation targets ---
    const staggerTargets = document.querySelectorAll(
        '.services-grid, .metrics-grid, .eco-items, .about-achievements, .buyer-tags'
    );

    staggerTargets.forEach(el => el.classList.add('stagger-children'));

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
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        fadeTargets.forEach(el => observer.observe(el));
        staggerTargets.forEach(el => observer.observe(el));
    } else {
        fadeTargets.forEach(el => el.classList.add('visible'));
        staggerTargets.forEach(el => el.classList.add('visible'));
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
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);

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

    // --- Active nav link highlighting on scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navLinkItems = document.querySelectorAll('.nav-links a[href^="#"]');

    function highlightNav() {
        const scrollY = window.scrollY + navbar.offsetHeight + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                navLinkItems.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNav, { passive: true });
});
