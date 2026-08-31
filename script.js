document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  /* =========================================================
     1) NAVBAR: fundo ao rolar + menu mobile + link ativo
  ========================================================= */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const navAnchors = document.querySelectorAll('[data-nav]');

  const setNavScrolled = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  };
  setNavScrolled();
  window.addEventListener('scroll', setNavScrolled, { passive: true });

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navAnchors.forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Destaca o link da seção visível
  const sections = ['inicio', 'skills', 'certificates', 'projects', 'contato']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(sec => navObserver.observe(sec));
  }

  /* =========================================================
     2) BARRA DE PROGRESSO DE SCROLL
  ========================================================= */
  const progressBar = document.getElementById('scrollProgress');
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  /* =========================================================
     3) BOTÃO VOLTAR AO TOPO
  ========================================================= */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    const toggleBackToTop = () => backToTop.classList.toggle('show', window.scrollY > 500);
    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* =========================================================
     4) CURSOR CUSTOMIZADO — só em dispositivos com mouse de precisão.
        Nunca deixa o cursor do sistema invisível em telas sem suporte.
  ========================================================= */
  if (finePointer && !reduceMotion) {
    document.documentElement.classList.add('has-custom-cursor');
    const cursor = document.getElementById('cursor');
    const trail = document.getElementById('cursor-trail');

    if (cursor && trail) {
      let trailX = 0, trailY = 0, targetX = 0, targetY = 0;

      document.addEventListener('mousemove', e => {
        targetX = e.clientX;
        targetY = e.clientY;
        cursor.style.transform = `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`;
      });

      const animateTrail = () => {
        trailX += (targetX - trailX) * 0.18;
        trailY += (targetY - trailY) * 0.18;
        trail.style.transform = `translate(${trailX}px, ${trailY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateTrail);
      };
      requestAnimationFrame(animateTrail);

      document.querySelectorAll('a, button, .skill-item, .card').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-expand'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-expand'));
      });
    }
  }

  /* =========================================================
     5) SCROLL REVEAL (agora com CSS correspondente — funciona de fato)
  ========================================================= */
  const revealGroups = [
    document.querySelectorAll('.section-header'),
    document.querySelectorAll('.skill-item'),
    document.querySelectorAll('.certificate-card'),
    document.querySelectorAll('.card'),
  ];

  revealGroups.forEach(group => {
    group.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--d', String((i % 6) * 70));
    });
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  } else {
    // Sem suporte a IntersectionObserver: mostra tudo direto
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }

  /* =========================================================
     6) TEXTO ROTATIVO NO HERO (efeito de digitação real)
  ========================================================= */
  const typingEl = document.getElementById('typing-role');
  if (typingEl) {
    const roles = ['React', 'Node.js', 'PHP', 'MySQL & MongoDB'];

    if (reduceMotion) {
      typingEl.textContent = roles[0];
    } else {
      let roleIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const tick = () => {
        const current = roles[roleIndex];

        if (!deleting) {
          charIndex++;
          typingEl.textContent = current.slice(0, charIndex);
          if (charIndex === current.length) {
            deleting = true;
            setTimeout(tick, 1600);
            return;
          }
        } else {
          charIndex--;
          typingEl.textContent = current.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
          }
        }
        setTimeout(tick, deleting ? 35 : 70);
      };
      setTimeout(tick, 500);
    }
  }

  /* =========================================================
     7) PRÉVIA DOS SITES — imagem estática (não depende de iframe/CSP).
        Se a prévia externa falhar por qualquer motivo, mostra um
        fallback elegante em vez de deixar o card quebrado/em branco.
  ========================================================= */
  document.querySelectorAll('[data-preview]').forEach(win => {
    const img = win.querySelector('.preview-img');
    if (!img) return;
    const src = img.getAttribute('data-src');

    const showFallback = () => {
      win.classList.remove('preview-ok');
      img.style.display = 'none';
    };

    img.addEventListener('load', () => {
      // thum.io eventualmente retorna uma imagem de erro minúscula; filtra por tamanho
      if (img.naturalWidth < 40) { showFallback(); return; }
      win.classList.add('preview-ok');
      img.classList.add('loaded');
    });
    img.addEventListener('error', showFallback);

    // timeout de segurança: se em 8s não carregou, assume fallback
    const safety = setTimeout(() => {
      if (!img.classList.contains('loaded')) showFallback();
    }, 8000);
    img.addEventListener('load', () => clearTimeout(safety));

    if (src) img.src = src;
  });

  /* =========================================================
     8) LEVE EFEITO 3D NOS CARDS DE SITES (só com mouse de precisão)
  ========================================================= */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      const strength = 6; // graus máximos de inclinação
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }
});
