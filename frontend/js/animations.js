// House in Jannah Animation Logic

const jannahAnimation = document.getElementById('jannah-animation');
const closeAnimationBtn = document.getElementById('close-animation');

// Listen for updates from app.js via global function or event
// Since we are in the same window, we can just export a function called by app.js
// But simpler: app.js calls checkJannahStatus() which is defined here or inside app.js.
// Since I defined checkJannahStatus in app.js (placeholder), let's implement the specific logic here 
// and attaching it to the window or just merging logic. 
// Actually, let's keep it clean. I'll make this file handle the specific visual effects.

window.checkJannahStatus = function () {
    const sunnahs = window.getSunnahStatus();
    const allSunnahsDone = sunnahs.fajr && sunnahs.dhuhr && sunnahs.maghrib && sunnahs.isha;

    // Check if we already showed it today to avoid annoying popup on every reload?
    // For now, let's show it if it transitions from incomplete to complete.
    // We can use a session variable or just show it if `allSunnahsDone` is true AND
    // user just clicked one of them.

    // Ideally, app.js knows if it was a user interaction.
    // Let's assume this function is called on every update.

    // We only want to trigger if ALL are present.
    if (allSunnahsDone) {
        // Check local storage to see if already celebrated for this date
        const today = new Date().toISOString().split('T')[0];
        const celebrated = localStorage.getItem(`jannah_celebrated_${today}`);

        if (!celebrated) {
            triggerJannahAnimation();
            localStorage.setItem(`jannah_celebrated_${today}`, 'true');
        }
    }
}

function triggerJannahAnimation() {
    jannahAnimation.classList.add('visible');
    startConfetti();
    playSound(); // Optional
}

closeAnimationBtn.addEventListener('click', () => {
    jannahAnimation.classList.remove('visible');
    stopConfetti();
});

// Simple Confetti Implementation
let confettiInterval;
const colors = ['#fbbf24', '#f59e0b', '#fff', '#10b981'];

function startConfetti() {
    if (confettiInterval) return;

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

function playSound() {
    // Optional: Add a subtle sound effect
    // const audio = new Audio('success.mp3');
    // audio.play();
}
