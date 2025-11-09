// Map section -> nav link
const sections = document.querySelectorAll("main section");
const navLinks = document.querySelectorAll("nav a");
const backToTopBtn = document.getElementById('backToTop');
const SHOW_AFTER = 300;

// helper: clear current
function clearActive() {
  navLinks.forEach(a => a.classList.remove("active"));
}

function toggleBackToTop() {
  if (window.scrollY > SHOW_AFTER) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }
}

function scrollToTop() {
  // respect reduced motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    window.scrollTo(0, 0);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// observer: watches which section is in view
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      clearActive();
      const link = document.querySelector(`nav a[href="#${id}"]`);
      if (link) link.classList.add("active");
    }
  });
}, {
  root: null,
  threshold: 0.6,            // section must be 60% visible
  rootMargin: "-120px 0px -35% 0px" // offset for sticky header height
});

window.addEventListener('scroll', () => {
  const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
  if (nearBottom) {
    clearActive();
    const last = document.querySelector('nav a[href="#TREACHERY"]'); // use your exact ID
    if (last) last.classList.add('active');
  }
});

window.addEventListener('scroll', toggleBackToTop, { passive: true });
backToTopBtn.addEventListener('click', scrollToTop);


// start observing
sections.forEach(sec => observer.observe(sec));
toggleBackToTop();



/*FLAMES

// === FLAME PARTICLES =========================================================
(() => {
  const canvas = document.getElementById('flameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Respect reduced motion
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (REDUCED) {
    // still draw a faint static glow
    resize();
    ctx.fillStyle = 'rgba(255, 60, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  // DPI-correct sizing
  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const w = Math.floor(window.innerWidth);
    const h = Math.floor(window.innerHeight);
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // Particle pool for performance
  const MAX = 140;                   // cap count (tweak)
  const pool = [];
  const active = [];

  function spawnBurst(baseX, count=12) {
    for (let i = 0; i < count; i++) spawn(baseX + rand(-60, 60));
  }

  function spawn(x) {
    if (active.length >= MAX) return;
    const p = pool.pop() || {};
    p.x = x ?? rand(0, window.innerWidth);
    p.y = window.innerHeight + rand(0, 40);  // start slightly below bottom
    p.vx = rand(-0.35, 0.35);
    p.vy = rand(-1.5, -2.8);                 // upward
    p.life = rand(1.2, 2.4);                 // seconds
    p.age = 0;
    p.size = rand(1.5, 3.2);
    p.hue = rand(12, 22);                    // orange -> red range
    p.sat = rand(85, 100);
    p.light = rand(45, 60);
    active.push(p);
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  // Base spawn rate (per frame, scaled with time)
  let spawnAccumulator = 0;
  const spawnPerSecond = 55;                 // tweak density

  // React to scroll: more embers while scrolling
  let lastScrollY = window.scrollY;
  let scrollBoost = 0;
  window.addEventListener('scroll', () => {
    const dy = Math.abs(window.scrollY - lastScrollY);
    lastScrollY = window.scrollY;
    scrollBoost = Math.min(120, scrollBoost + dy * 0.5); // add boost
  }, { passive: true });

  // Main loop
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000); // clamp dt
    last = now;

    // fade the canvas slightly for a trail effect (cheap motion blur)
    ctx.globalCompositeOperation = 'destination-out-over';
    ctx.fillStyle = 'rgba(0,0,0,0.08)';     // stronger fade = shorter trails
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.globalCompositeOperation = 'lighter';

    // spawn
    const baseRate = spawnPerSecond + scrollBoost;
    scrollBoost = Math.max(0, scrollBoost - 60 * dt); // decay boost
    spawnAccumulator += baseRate * dt;
    const center = window.innerWidth * 0.5;          // spawn around center
    while (spawnAccumulator >= 1) {
      spawn(center + rand(-window.innerWidth * 0.25, window.innerWidth * 0.25));
      spawnAccumulator -= 1;
    }

    // update & draw
    ctx.globalCompositeOperation = 'lighter'; // additive for glow
    for (let i = active.length - 1; i >= 0; i--) {
      const p = active[i];
      p.age += dt;
      if (p.age >= p.life) {
        pool.push(active.splice(i, 1)[0]);
        continue;
      }
      // motion
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      p.vx *= 0.995;             // slight horizontal damping
      p.vy -= 0.01;              // accelerate upward a bit (heat)

      // size + alpha over life
      const t = p.age / p.life;           // 0..1
      const alpha = (1 - t) * 0.7;        // fade out
      const size = p.size * (1 + t * 0.8);

      // color shifts from yellowish to red
      const hue = p.hue - t * 10;
      const light = p.light - t * 10;

      // draw glow circle
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
      grad.addColorStop(0, `hsla(${hue}, ${p.sat}%, ${Math.max(light,20)}%, ${alpha})`);
      grad.addColorStop(1, `hsla(${hue}, ${p.sat}%, 10%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
*/
