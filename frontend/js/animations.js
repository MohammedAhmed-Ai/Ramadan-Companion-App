// ==========================================
// 1. House in Jannah Celebration Animation
// ==========================================
const jannahAnimation = document.getElementById('jannah-animation');
const closeAnimationBtn = document.getElementById('close-animation');

// Global function to check status
window.checkJannahStatus = function () {
    if (!window.getSunnahStatus) return; // Guard if app.js not loaded yet

    const sunnahs = window.getSunnahStatus();
    const allSunnahsDone = sunnahs.fajr && sunnahs.dhuhr && sunnahs.maghrib && sunnahs.isha;

    if (allSunnahsDone) {
        const today = new Date().toISOString().split('T')[0];
        const celebrated = localStorage.getItem(`jannah_celebrated_${today}`);

        if (!celebrated) {
            triggerJannahAnimation();
            localStorage.setItem(`jannah_celebrated_${today}`, 'true');
        }
    }
}

function triggerJannahAnimation() {
    if (jannahAnimation) {
        jannahAnimation.classList.remove('hidden');
        // Small delay to allow display:block to apply before opacity transition
        setTimeout(() => {
            jannahAnimation.dataset.state = 'visible';
        }, 10);
        startConfetti();
    }
}

if (closeAnimationBtn) {
    closeAnimationBtn.addEventListener('click', () => {
        if (jannahAnimation) {
            jannahAnimation.dataset.state = 'hidden';
            setTimeout(() => {
                jannahAnimation.classList.add('hidden');
            }, 1000); // Wait for transition
            stopConfetti();
        }
    });

}

// Simple Confetti Implementation
let confettiInterval;
const colors = ['#fbbf24', '#f59e0b', '#fff', '#10b981'];

function startConfetti() {
    if (confettiInterval || !jannahAnimation) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    jannahAnimation.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 5 + 2,
            speed: Math.random() * 3 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            angle: Math.random() * 6.28
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.y += p.speed;
            p.x += Math.sin(p.angle) * 1;
            p.angle += 0.05;

            if (p.y > canvas.height) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    confettiInterval = setInterval(() => requestAnimationFrame(draw), 20);
}

function stopConfetti() {
    clearInterval(confettiInterval);
    confettiInterval = null;
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) canvas.remove();
}


// ==========================================
// 2. Dual-Theme Background Animation System
// ==========================================
(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let animationFrameId;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // --- Particle Classes ---

    class Star {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.2; // Slow drift
            this.vy = (Math.random() - 0.5) * 0.2;
            this.size = Math.random() * 2 + 0.5; // Slightly larger for visibility
            this.opacity = Math.random() * 0.7 + 0.3;
            // Gold or White
            this.color = Math.random() > 0.8 ? '251, 191, 36' : '255, 255, 255';
            this.glow = Math.random() > 0.9;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
            ctx.fill();
            if (this.glow) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(${this.color}, 0.8)`;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    class MorningParticle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.3; // Gentle float
            this.vy = (Math.random() - 0.5) * 0.3;
            this.size = Math.random() * 3 + 1; // Distinct but soft

            // Ultra-premium morning colors
            const colors = [
                'rgba(212, 175, 55, 0.4)',  // Soft Gold
                'rgba(244, 164, 96, 0.4)',  // Champagne/Sand
                'rgba(184, 115, 51, 0.3)'   // Soft Bronze
            ];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // --- Animation Logic ---

    function initAnimation() {
        particles = [];
        const isDark = document.documentElement.classList.contains('dark');

        if (isDark) {
            // Dark Mode: Enhanced Starfield
            for (let i = 0; i < 100; i++) {
                particles.push(new Star());
            }
        } else {
            // Light Mode: Morning Gold Particles
            for (let i = 0; i < 60; i++) {
                particles.push(new MorningParticle());
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        const isDark = document.documentElement.classList.contains('dark');

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Connection logic
        if (isDark) {
            // Dark Mode Connections (White/Subtle)
            particles.forEach((p, i) => {
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const distance = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });
        } else {
            // Light Mode Connections (Warm Gold)
            particles.forEach((p, i) => {
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const distance = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (distance < 100) {
                        ctx.beginPath();
                        // Subtle warm gold connection
                        ctx.strokeStyle = `rgba(212, 175, 55, ${0.1 * (1 - distance / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // --- Public Control ---
    window.updateBackgroundTheme = function () {
        initAnimation();
    };

    // Auto-init on load
    initAnimation();
    animate();

})();


// ==========================================
// 3. Professional Scroll Reveal System
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove hidden state, add visible state
                entry.target.classList.remove('opacity-0', 'translate-y-10');
                entry.target.classList.add('opacity-100', 'translate-y-0');
            } else {
                // Remove visible state, add hidden state (for continuous re-animation)
                entry.target.classList.remove('opacity-100', 'translate-y-0');
                entry.target.classList.add('opacity-0', 'translate-y-10');
            }
        });
    }, observerOptions);

    // Select all elements to be revealed
    const hiddenElements = document.querySelectorAll('.scroll-reveal');
    hiddenElements.forEach((el) => observer.observe(el));
});
