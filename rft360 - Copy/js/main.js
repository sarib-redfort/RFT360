/* ============================================================
   MAIN.JS — Redfort360 Premium Interaction Engine
   Scroll Snap | IntersectionObserver | Side Dots | Counters
   ============================================================ */

(function () {
  'use strict';

  // ─── Side Dot Navigation ───────────────────────────────────
  function initSideDots() {
    const container = document.querySelector('.scroll-container');
    const sections = document.querySelectorAll('.scroll-section');
    const dotsWrapper = document.querySelector('.side-dots');

    if (!dotsWrapper || !sections.length) return;

    // Build dots
    sections.forEach((section, i) => {
      const dot = document.createElement('div');
      dot.className = 'side-dot';
      dot.setAttribute('data-index', i);
      const label = section.getAttribute('data-label') || `Section ${i + 1}`;
      dot.setAttribute('data-label', label);

      dot.addEventListener('click', () => {
        section.scrollIntoView({ behavior: 'smooth' });
      });

      dotsWrapper.appendChild(dot);
    });

    // Update active dot on scroll
    function updateDots() {
      const scrollTop = container ? container.scrollTop : window.scrollY;
      const vh = window.innerHeight;
      const dots = dotsWrapper.querySelectorAll('.side-dot');

      let activeIndex = 0;
      sections.forEach((section, i) => {
        const sectionTop = section.offsetTop;
        if (scrollTop >= sectionTop - vh * 0.4) {
          activeIndex = i;
        }
      });

      dots.forEach((d, i) => {
        d.classList.toggle('active', i === activeIndex);
      });
    }

    if (container) {
      container.addEventListener('scroll', updateDots, { passive: true });
    } else {
      window.addEventListener('scroll', updateDots, { passive: true });
    }
    updateDots();
  }

  // ─── Scroll-Triggered Animations (IntersectionObserver) ───
  function initScrollAnimations() {
    const elements = document.querySelectorAll(
      '.animate-fade-up, .animate-fade-left, .animate-fade-right, .animate-scale'
    );

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        root: document.querySelector('.scroll-container'),
        threshold: 0.15,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));
  }

  // ─── Stat Counter Animation ────────────────────────────────
  function animateCounter(el, targetStr, duration = 1600) {
    const suffix = targetStr.replace(/[0-9.]/g, '');
    const target = parseFloat(targetStr.replace(/[^0-9.]/g, ''));
    const isFloat = targetStr.includes('.');
    let start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      const current = eased * target;
      el.textContent = isFloat
        ? current.toFixed(1) + suffix
        : Math.floor(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = targetStr;
      }
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.dataset.counted) {
            entry.target.dataset.counted = 'true';
            animateCounter(entry.target, entry.target.dataset.count);
          }
        });
      },
      {
        root: document.querySelector('.scroll-container'),
        threshold: 0.5,
      }
    );

    counters.forEach((el) => observer.observe(el));
  }

  // ─── Progress Bar Animation ────────────────────────────────
  function initProgressBars() {
    const bars = document.querySelectorAll('.progress-fill[data-width]');
    if (!bars.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.dataset.animated) {
            entry.target.dataset.animated = 'true';
            setTimeout(() => {
              entry.target.style.width = entry.target.dataset.width;
            }, 300);
          }
        });
      },
      {
        root: document.querySelector('.scroll-container'),
        threshold: 0.3,
      }
    );

    bars.forEach((bar) => observer.observe(bar));
  }

  // ─── Terminal Typing Effect ────────────────────────────────
  function initTerminal() {
    const terminal = document.getElementById('terminal-body');
    if (!terminal) return;

    const lines = [
      { cls: 't-comment', text: '// Initializing Redfort360 engine...' },
      { cls: 't-keyword', text: 'import', inline: true },
      { cls: 't-default', text: ' { ', inline: true },
      { cls: 't-class', text: 'Application', inline: true },
      { cls: 't-default', text: ' } ', inline: true },
      { cls: 't-keyword', text: 'from', inline: true },
      { cls: 't-string', text: " 'scalable-engine'", inline: true },
      { cls: 't-default', text: ';', newline: true },
      { cls: 't-keyword', text: 'const', inline: true },
      { cls: 't-default', text: ' app = ', inline: true },
      { cls: 't-class', text: 'new', inline: true },
      { cls: 't-default', text: ' Application({', newline: true },
      { cls: 't-string', text: "  performance", inline: true },
      { cls: 't-default', text: ': ', inline: true },
      { cls: 't-string', text: "'ultra'", inline: true },
      { cls: 't-default', text: ',', newline: true },
      { cls: 't-string', text: "  security", inline: true },
      { cls: 't-default', text: ': ', inline: true },
      { cls: 't-string', text: "'enterprise'", inline: true },
      { cls: 't-default', text: ',', newline: true },
      { cls: 't-string', text: "  scalability", inline: true },
      { cls: 't-default', text: ': ', inline: true },
      { cls: 't-class', text: 'true', inline: true },
      { cls: 't-default', text: ',', newline: true },
      { cls: 't-default', text: '});', newline: true },
      { cls: 't-default', text: '', newline: true },
      { cls: 't-operator', text: 'app', inline: true },
      { cls: 't-default', text: '.start(', inline: true },
      { cls: 't-number', text: '3000', inline: true },
      { cls: 't-default', text: ');', newline: true },
      { cls: 't-comment', text: '// ✓ System online — ready to scale.' },
    ];

    terminal.innerHTML = '';
    let lineEl = null;
    let cursor = document.createElement('span');
    cursor.className = 't-cursor';
    terminal.appendChild(cursor);

    let delay = 600;
    lines.forEach((token) => {
      setTimeout(() => {
        if (!token.inline || !lineEl) {
          lineEl = document.createElement('span');
          lineEl.className = 't-line';
          terminal.insertBefore(lineEl, cursor);
        }

        const span = document.createElement('span');
        span.className = token.cls;
        span.textContent = token.text;
        lineEl.appendChild(span);

        if (token.newline) lineEl = null;

        terminal.scrollTop = terminal.scrollHeight;
      }, delay);
      delay += token.text.length * 22 + (token.newline ? 120 : 30);
    });

    setTimeout(() => {
      cursor.remove();
    }, delay + 800);
  }

  // ─── Navbar shrink on scroll ───────────────────────────────
  function initNavbar() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;

    const container = document.querySelector('.scroll-container');
    const handler = () => {
      const scrollY = container ? container.scrollTop : window.scrollY;
      nav.classList.toggle('scrolled', scrollY > 60);
    };

    if (container) {
      container.addEventListener('scroll', handler, { passive: true });
    } else {
      window.addEventListener('scroll', handler, { passive: true });
    }
  }

  // ─── Parallax Glow Orbs on mouse move ─────────────────────
  function initParallax() {
    const orbs = document.querySelectorAll('.glow-orb');
    if (!orbs.length) return;

    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      orbs.forEach((orb, i) => {
        const factor = (i + 1) * 0.4;
        orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
      });
    });
  }

  // ─── Section active reveal on snap ────────────────────────
  function initSectionReveal() {
    const sections = document.querySelectorAll('.scroll-section');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-active');
          }
        });
      },
      {
        root: document.querySelector('.scroll-container'),
        threshold: 0.5,
      }
    );

    sections.forEach((s) => observer.observe(s));
  }

  // ─── INIT ALL ──────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initSideDots();
    initScrollAnimations();
    initCounters();
    initProgressBars();
    initTerminal();
    initParallax();
    initSectionReveal();
  });
})();
