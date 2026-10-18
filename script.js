/* ==========================================================================
   SCRIPT.JS — Portfolio Mohamed Lhikioui
   Architecture Modulaire — Vanilla JavaScript (No Frameworks)
   ========================================================================== */

'use strict';

// ==========================================================================
// 1. CONFIGURATION DES MODULES HTML À CHARGER DYNAMIQUEMENT
// ==========================================================================
const MODULES_TO_LOAD = [
  'accueil.html',
  'apropos.html',
  'competences.html',
  'projets.html',
  'contact.html'
];

/**
 * Charge un fragment HTML via l'API Fetch
 * @param {string} url - Nom ou chemin du fragment HTML
 * @returns {Promise<string>} - Contenu HTML sous forme de chaîne
 */
async function fetchFragment(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} lors du chargement de "${url}"`);
  }
  return await response.text();
}

/**
 * Charge tous les modules HTML en parallèle et les insère dans le conteneur principal
 */
async function loadAllModules() {
  const container = document.getElementById('main-content');
  if (!container) return;

  try {
    // Chargement parallèle avec Promise.all pour des performances optimales
    const fragments = await Promise.all(MODULES_TO_LOAD.map(fetchFragment));

    // Injection dans le conteneur principal
    container.innerHTML = fragments.join('\n');

    // INITIALISATION DES COMPOSANTS INTERACTIFS DYNAMIQUES
    // (Cette étape est cruciale car les éléments viennent d'être créés dans le DOM)
    initDynamicComponents();

    // Si un hash d'ancrage est présent dans l'URL (#projets, etc.), naviguer dessus
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) {
        setTimeout(() => {
          const navH = document.getElementById('navbar')?.offsetHeight || 70;
          const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 100);
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des modules :', error);
    container.innerHTML = `
      <div style="text-align: center; padding: 100px 20px; color: #ff5555; font-family: 'Fira Code', monospace;">
        <h2 style="margin-bottom: 15px; color: #ff5555;">⚠️ Échec du chargement modulaire</h2>
        <p style="color: #cbd5e1; max-width: 600px; margin: 0 auto 20px; line-height: 1.6;">
          L'API <code>fetch()</code> nécessite un protocole HTTP/HTTPS et ne fonctionne pas avec <code>file:///</code>.
        </p>
        <p style="color: #00F0FF; font-size: 0.9rem;">
          💡 Lancez le projet avec <strong>Live Server</strong> dans votre éditeur ou <code>npx serve .</code>
        </p>
      </div>
    `;
  }
}

// ==========================================================================
// 2. FOND DE PARTICULES INTERACTIVES (CANVAS)
// ==========================================================================
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.reset();
  }

  Particle.prototype.reset = function () {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.size = Math.random() * 1.5 + 0.3;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.opacity = Math.random() * 0.5 + 0.1;
    this.color = Math.random() > 0.5 ? '0, 240, 255' : '138, 43, 226';
  };

  Particle.prototype.update = function () {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  };

  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(' + this.color + ', ' + this.opacity + ')';
    ctx.fill();
  };

  function initAll() {
    particles = [];
    const count = Math.min(Math.floor((W * H) / 12000), 120);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(0, 240, 255, ' + alpha + ')';
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  resize();
  initAll();
  animate();
  window.addEventListener('resize', () => { resize(); initAll(); });
})();

// ==========================================================================
// 3. LOGIQUE GLOBALE PERSISTANTE (NAVBAR, PROGRESSION, RETOUR HAUT)
// ==========================================================================
function updateScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  bar.style.width = pct + '%';
}

function updateNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  nav.classList.toggle('scrolled', window.scrollY > 50);
}

function updateBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  btn.classList.toggle('visible', window.scrollY > 400);
}

document.getElementById('back-to-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let currentSection = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) currentSection = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + currentSection) link.classList.add('active');
  });
}

// Événement de défilement (Scroll)
window.addEventListener('scroll', () => {
  updateScrollProgress();
  updateNavbar();
  updateBackToTop();
  updateActiveNavLink();
}, { passive: true });

// Menu burger mobile
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle?.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen.toString());
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

// Curseur interactif Glow Effect
(function initCursorGlow() {
  const cursorGlow = document.createElement('div');
  cursorGlow.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle,rgba(0,240,255,0.04) 0%,transparent 70%);transform:translate(-50%,-50%);transition:transform 0.1s;top:0;left:0;';
  document.body.appendChild(cursorGlow);

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    cursorGlow.style.left = glowX + 'px';
    cursorGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
})();

// Déclaration dynamique du style d'animation fadeIn pour les cartes de projets
const styleEl = document.createElement('style');
styleEl.textContent = '@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }';
document.head.appendChild(styleEl);

// ==========================================================================
// 4. INITIALISATION DES COMPOSANTS INJECTÉS DYNAMIQUEMENT
// ==========================================================================
function initDynamicComponents() {
  // A. Smooth Scroll sur les ancres injectées et globales
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navH = document.getElementById('navbar')?.offsetHeight || 70;
        const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // B. Intersection Observer — Effet Reveal sur le scroll
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // C. Intersection Observer — Barres de compétences
  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.skill-fill').forEach((fill, i) => {
          const targetWidth = fill.getAttribute('data-target') || '80%';
          fill.style.setProperty('--target', targetWidth);
          setTimeout(() => fill.classList.add('animated'), i * 120);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.skill-card').forEach(card => skillObserver.observe(card));

  // D. Animation des compteurs statistiques
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const start = performance.now();
    function update(time) {
      const elapsed = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) counterObserver.observe(heroStats);

  // E. Filtres de projets
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      projectCards.forEach((card, i) => {
        const cat = card.getAttribute('data-category');
        const show = filter === 'all' || cat === filter;
        if (show) {
          card.classList.remove('hidden');
          card.style.animation = '';
          void card.offsetWidth;
          card.style.animation = 'fadeIn 0.4s ease both';
          card.style.animationDelay = (i * 0.05) + 's';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // F. Effet 3D Tilt sur les cartes de projets
  projectCards.forEach(card => {
    card.addEventListener('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const maxTilt = 4;
      const tiltX = (y / (rect.height / 2)) * maxTilt;
      const tiltY = -(x / (rect.width / 2)) * maxTilt;
      this.style.transform = 'perspective(1000px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () {
      this.style.transform = '';
    });
  });

  // G. Effet machine à écrire sur le message d'accueil
  const greetingEl = document.querySelector('.hero-greeting');
  if (greetingEl) {
    const text = greetingEl.textContent;
    greetingEl.textContent = '';
    greetingEl.style.borderRight = '2px solid var(--cyan, #00F0FF)';
    let i = 0;
    const typeInterval = setInterval(() => {
      greetingEl.textContent += text[i++];
      if (i >= text.length) {
        clearInterval(typeInterval);
        setTimeout(() => { greetingEl.style.borderRight = 'none'; }, 1000);
      }
    }, 60);
  }

  // H. Animation d'entrée du Hero
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) {
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(30px)';
    heroContent.style.transition = 'opacity 1s ease, transform 1s ease';
    setTimeout(() => {
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    }, 200);
  }

  // I. Validation et soumission du formulaire de contact
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    function showFieldError(fieldId, message) {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(fieldId + '-error');
      if (field) field.classList.add('error');
      if (error) error.textContent = message;
    }

    function clearFieldError(fieldId) {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(fieldId + '-error');
      if (field) field.classList.remove('error');
      if (error) error.textContent = '';
    }

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    ['name', 'email', 'message'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => clearFieldError(id));
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      let valid = true;
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const message = document.getElementById('message')?.value.trim();

      clearFieldError('name'); clearFieldError('email'); clearFieldError('message');

      if (!name || name.length < 2) {
        showFieldError('name', 'Veuillez entrer votre nom complet.');
        valid = false;
      }
      if (!email || !validateEmail(email)) {
        showFieldError('email', 'Veuillez entrer une adresse email valide.');
        valid = false;
      }
      if (!message || message.length < 10) {
        showFieldError('message', 'Le message doit comporter au moins 10 caractères.');
        valid = false;
      }

      if (!valid) return;

      const btn = document.getElementById('submit-btn');
      const btnText = document.getElementById('btn-text');
      if (btn) btn.disabled = true;
      if (btnText) btnText.textContent = 'Envoi en cours...';

      setTimeout(() => {
        if (btn) btn.disabled = false;
        if (btnText) btnText.textContent = 'Envoyer le message';
        contactForm.reset();
        const successEl = document.getElementById('form-success');
        if (successEl) {
          successEl.classList.add('show');
          setTimeout(() => successEl.classList.remove('show'), 5000);
        }
      }, 1500);
    });
  }

  // Recalcul initial de la navbar et du lien actif
  updateActiveNavLink();
}

// ==========================================================================
// 5. DÉMARRAGE DE L'APPLICATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  updateBackToTop();
  loadAllModules();
});

console.log('%c Mohamed Lhikioui — Architecture Modulaire Vanilla JS', 'color: #00F0FF; font-size: 16px; font-weight: bold; font-family: Fira Code;');
