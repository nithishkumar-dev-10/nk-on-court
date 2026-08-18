

document.addEventListener('DOMContentLoaded', () => {

  /* ── LOADER ── */
  const loader = document.getElementById('loader');
  setTimeout(() => {
    if (loader) loader.classList.add('out');
  }, 1500);

  /* ── CUSTOM CURSOR ── */
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  // Lag ring
  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Cursor hover effect
  document.querySelectorAll('a, button, .proj-card, .ach-card, .skill-category').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2)';
      cursorRing.style.width = '55px';
      cursorRing.style.height = '55px';
      cursorRing.style.borderColor = 'rgba(240,184,64,0.7)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      cursorRing.style.width = '38px';
      cursorRing.style.height = '38px';
      cursorRing.style.borderColor = 'rgba(240,184,64,0.45)';
    });
  });

  /* ── HERO CANVAS — Colorful Particles + Court Lines ── */
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H;
    const mouse = { x: -999, y: -999 };

    // Particle colors — volleyball palette
    const COLORS = [
      'rgba(240,184,64,',   // gold
      'rgba(26,143,255,',   // blue
      'rgba(255,107,53,',   // orange
      'rgba(0,230,118,',    // green
      'rgba(255,255,255,',  // white
    ];

    const COUNT = 120;
    const PARTICLES = [];

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function Particle() { this.reset(true); }
    Particle.prototype.reset = function(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : -10;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.r = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.45 + 0.08;
      this.colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
    };

    for (let i = 0; i < COUNT; i++) PARTICLES.push(new Particle());

    function drawCourtLines() {
      ctx.save();

      // Main center net line
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = '#f0b840';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();

      // Top band of net
      ctx.globalAlpha = 0.04;
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(W / 2 - 3, 0, 6, H);

      // Attack lines
      ctx.lineWidth = 1;
      ctx.setLineDash([7, 6]);
      ['rgba(26,143,255,0.05)', 'rgba(26,143,255,0.05)'].forEach((color, i) => {
        ctx.strokeStyle = color;
        const x = i === 0 ? W * 0.33 : W * 0.67;
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, H);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Court boundary
      ctx.strokeStyle = 'rgba(100,160,255,0.04)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(W * 0.04, H * 0.06, W * 0.92, H * 0.88);

      // Horizontal mid-line
      ctx.globalAlpha = 0.03;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.5); ctx.lineTo(W, H * 0.5);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.stroke();

      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      drawCourtLines();

      for (let i = 0; i < PARTICLES.length; i++) {
        const p = PARTICLES[i];
        p.x += p.vx; p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        // Mouse repel
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) {
          const force = (130 - d) / 130;
          p.x += dx * force * 0.02;
          p.y += dy * force * 0.02;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.colorBase + p.alpha + ')';
        ctx.fill();
      }

      // Connect nearby
      for (let i = 0; i < PARTICLES.length; i++) {
        for (let j = i + 1; j < PARTICLES.length; j++) {
          const dx = PARTICLES[i].x - PARTICLES[j].x;
          const dy = PARTICLES[i].y - PARTICLES[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(PARTICLES[i].x, PARTICLES[i].y);
            ctx.lineTo(PARTICLES[j].x, PARTICLES[j].y);
            const alpha = (1 - d / 100) * 0.14;
            ctx.strokeStyle = `rgba(240,184,64,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
  }

  /* ── TYPED EFFECT ── */
  const typed = document.getElementById('typed');
  if (typed) {
    const words = ['AI Engineer', 'Python Developer', 'ML Engineer', 'Backend Builder', 'Hackathon Winner', 'Agent Architect'];
    let wi = 0, ci = 0, deleting = false;
    function tick() {
      const word = words[wi];
      if (!deleting) {
        typed.textContent = word.substring(0, ci + 1);
        ci++;
        if (ci === word.length) { deleting = true; setTimeout(tick, 2400); return; }
      } else {
        typed.textContent = word.substring(0, ci - 1);
        ci--;
        if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
      }
      setTimeout(tick, deleting ? 45 : 85);
    }
    tick();
  }

  /* ── NAVBAR SCROLL ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    updateNav();
  });

  function updateNav() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link');
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 180) current = s.id; });
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  }

  /* ── SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMob();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ── MOBILE MENU ── */
  const mob = document.getElementById('mobile-menu');
  const ham = document.getElementById('hamburger');
  function openMob() {
    mob.classList.add('open');
    document.body.style.overflow = 'hidden';
    const spans = ham.querySelectorAll('span');
    spans[0].style.transform = 'rotate(45deg) translate(5px, 4.5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -4.5px)';
  }
  function closeMob() {
    mob.classList.remove('open');
    document.body.style.overflow = '';
    ham.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
  if (ham) ham.addEventListener('click', () => mob.classList.contains('open') ? closeMob() : openMob());

  /* ── SCROLL REVEAL ── */
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revObs.observe(el));

  /* ── SKILL BARS ANIMATION ── */
  const skillObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-fill').forEach((bar, i) => {
          setTimeout(() => bar.classList.add('animated'), i * 120);
        });
        skillObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.skill-category').forEach(c => skillObs.observe(c));

  /* ── PROJECT CARD MOUSE GLOW ── */
  document.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* ── BALL PARALLAX ── */
  const ballScene = document.getElementById('ball-scene');
  if (ballScene) {
    document.addEventListener('mousemove', e => {
      const xPct = (e.clientX / window.innerWidth - 0.5) * 16;
      const yPct = (e.clientY / window.innerHeight - 0.5) * 10;
      ballScene.style.transform = `rotateY(${xPct}deg) rotateX(${-yPct}deg)`;
    });
  }

  
  const court = document.getElementById('court-3d');
  if (court) {
    const wrapper = court.parentElement;
    wrapper.addEventListener('mousemove', e => {
      const r = wrapper.getBoundingClientRect();
      const xPct = (e.clientX - r.left) / r.width - 0.5;
      const yPct = (e.clientY - r.top) / r.height - 0.5;
      court.style.transform = `rotateX(${22 + yPct * 10}deg) rotateY(${xPct * 8}deg)`;
    });
    wrapper.addEventListener('mouseleave', () => {
      court.style.transform = 'rotateX(22deg) rotateY(0deg)';
    });
  }


  const submitBtn = document.getElementById('form-submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const msg = document.getElementById('message').value.trim();
      if (!name || !email || !msg) { showToast('Please fill in all fields.', false); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('Please enter a valid email.', false); return; }
      const s = encodeURIComponent('Portfolio Contact from ' + name);
      const b = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + msg);
      window.open('https://mail.google.com/mail/?view=cm&to=nithishkumar.dev10@gmail.com&su=' + s + '&body=' + b, '_blank');
      document.getElementById('contact-form') && document.getElementById('contact-form').reset();
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      document.getElementById('message').value = '';
      showToast('Opening Gmail ✓ Message ready to send!', true);
    });
  }

  function showToast(msg, ok) {
    const old = document.querySelector('.vb-toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'vb-toast';
    t.style.cssText = `
      position:fixed; bottom:2rem; right:2rem;
      background:${ok ? 'linear-gradient(135deg,#f0b840,#ff6b35)' : '#e74c3c'};
      color:${ok ? '#000' : '#fff'};
      padding:0.9rem 1.6rem; border-radius:6px;
      font-family:'JetBrains Mono',monospace; font-size:0.75rem;
      letter-spacing:0.08em; z-index:99999;
      box-shadow:0 10px 40px rgba(0,0,0,0.4);
      animation:toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
      font-weight:600;
    `;
    t.textContent = msg;
    document.body.appendChild(t);
    if (!document.getElementById('toast-style')) {
      const style = document.createElement('style');
      style.id = 'toast-style';
      style.textContent = '@keyframes toastIn{from{transform:translateY(30px) scale(0.9);opacity:0}to{transform:none;opacity:1}}';
      document.head.appendChild(style);
    }
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.4s'; setTimeout(() => t.remove(), 400); }, 3500);
  }

  /* ── STAGGERED CARD ENTRANCE ── */
  const cardObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const cards = e.target.querySelectorAll('.proj-card, .ach-card, .os-card');
        cards.forEach((card, i) => {
          card.style.transitionDelay = (i * 0.1) + 's';
          card.classList.add('in');
        });
        cardObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.proj-cards, .ach-grid').forEach(g => cardObs.observe(g));

  /* ── COUNTER ANIMATION ── */
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.astat-val, .stat-card-val').forEach(el => {
          const target = parseInt(el.textContent);
          if (!isNaN(target) && target > 1) {
            let curr = 0;
            const inc = target / 40;
            const timer = setInterval(() => {
              curr = Math.min(curr + inc, target);
              el.textContent = Math.round(curr) + (el.dataset.suffix || '');
              if (curr >= target) clearInterval(timer);
            }, 30);
          }
        });
        counterObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.about-stats, .hero-right').forEach(el => counterObs.observe(el));

  /* ── ACHIEVEMENT CARD GLOW RANDOMIZE ── */
  document.querySelectorAll('.ach-glow').forEach((glow, i) => {
    const hues = ['rgba(240,184,64,0.3)', 'rgba(26,143,255,0.3)', 'rgba(0,230,118,0.3)'];
    glow.style.background = `radial-gradient(circle, ${hues[i % hues.length]}, transparent 70%)`;
  });

  /* ── SCROLL PROGRESS INDICATOR ── */
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position:fixed; top:0; left:0; height:2px; width:0%;
    background:linear-gradient(90deg, #f0b840, #ff6b35, #1a8fff);
    z-index:99999; transition:width 0.1s;
    pointer-events:none;
  `;
  document.body.appendChild(progressBar);
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (scrollTop / docHeight * 100) + '%';
  });


  document.querySelectorAll('.torb').forEach((pill, i) => {
    pill.style.opacity = '0';
    pill.style.transform += ' translateX(20px)';
    setTimeout(() => {
      pill.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      pill.style.opacity = '1';
      pill.style.transform = '';
    }, 800 + i * 150);
  });

 
  document.querySelectorAll('.skill-category').forEach((cat, i) => {
    cat.style.transitionDelay = (i * 0.12) + 's';
  });

});
