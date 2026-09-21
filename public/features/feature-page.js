(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initFeaturesNavigation() {
    const nav = document.querySelector('.feature-nav');
    const trigger = nav?.querySelector('.feature-menu-trigger');
    if (!nav || !trigger || nav.dataset.navReady === 'true') return;
    nav.dataset.navReady = 'true';
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    };
    trigger.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    document.addEventListener('click', (event) => {
      if (!nav.contains(event.target)) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.focus();
      }
    });
  }

  function initFeatureCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor || reducedMotion || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const ring = cursor.querySelector('.cursor-ring');
    const dot = cursor.querySelector('.cursor-dot');
    let tx = innerWidth / 2;
    let ty = innerHeight / 2;
    let rx = tx;
    let ry = ty;
    root.classList.add('has-custom-cursor');
    addEventListener('pointermove', (event) => {
      tx = event.clientX;
      ty = event.clientY;
      dot.style.transform = `translate3d(${tx}px,${ty}px,0)`;
    }, { passive: true });
    function render() {
      rx += (tx - rx) * .2;
      ry += (ty - ry) * .2;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      requestAnimationFrame(render);
    }
    render();
  }

  function initDesignerTilt() {
    const scene = document.querySelector('[data-tilt-scene]');
    const card = scene?.querySelector('.designer-window');
    if (!scene || !card || reducedMotion || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    scene.addEventListener('pointermove', (event) => {
      const rect = scene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      card.style.transform = `rotateX(${4 - y * 8}deg) rotateY(${-5 + x * 11}deg) translate3d(${x * 7}px,${y * 6}px,35px)`;
    });
    scene.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  }

  function initWorkflowSteps() {
    const steps = [...document.querySelectorAll('.workflow-step')];
    if (!steps.length || !('IntersectionObserver' in window) || reducedMotion) {
      steps.forEach((step) => step.classList.add('is-active'));
      return;
    }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        steps.forEach((step) => step.classList.toggle('is-active', step === entry.target));
      }
    }), { rootMargin: '-35% 0px -45%', threshold: .15 });
    steps.forEach((step) => observer.observe(step));
  }

  initFeaturesNavigation();
  initFeatureCursor();
  initDesignerTilt();
  initWorkflowSteps();
})();
