function initConnectedFeatureWorkflow() {
  const workflow = document.querySelector('[data-feature-workflow]');
  if (!workflow) return;

  const tabs = [...workflow.querySelectorAll('[data-feature-tab]')];
  const panels = [...workflow.querySelectorAll('[data-feature-panel]')];
  const arrows = [...workflow.querySelectorAll('[data-feature-direction]')];
  const normalizePath = (path) => {
    const clean = path.replace(/\/index$/, '').replace(/\/$/, '');
    return clean || '/';
  };
  const routes = tabs.map((tab) => normalizePath(new URL(tab.dataset.featureRoute, location.origin).pathname));
  let activeIndex = Number(workflow.dataset.activeIndex || 0);

  function setActive(index, options = {}) {
    const nextIndex = Math.max(0, Math.min(tabs.length - 1, index));
    const tab = tabs[nextIndex];
    if (!tab) return;

    activeIndex = nextIndex;
    workflow.dataset.activeIndex = String(activeIndex);

    tabs.forEach((item, itemIndex) => {
      const active = itemIndex === activeIndex;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      const marker = item.querySelector('span');
      if (marker) marker.textContent = active ? '✓' : String(itemIndex + 1).padStart(2, '0');
    });

    panels.forEach((panel) => {
      const active = panel.dataset.featurePanel === tab.dataset.featureTab;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });

    arrows.forEach((arrow) => {
      const direction = Number(arrow.dataset.featureDirection || 0);
      arrow.disabled = direction < 0 ? activeIndex === 0 : activeIndex === tabs.length - 1;
    });

    if (tab.dataset.featureTitle) document.title = tab.dataset.featureTitle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && tab.dataset.featureDescription) meta.setAttribute('content', tab.dataset.featureDescription);

    if (options.push) history.pushState({ featureIndex: activeIndex }, '', tab.dataset.featureRoute);
    if (options.scroll) {
      const navTop = workflow.querySelector('.connected-workflow-nav')?.getBoundingClientRect().top || 0;
      const target = Math.max(0, scrollY + navTop - 74);
      scrollTo({ top: target, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  }

  function indexFromHref(href) {
    let url;
    try {
      url = new URL(href, location.href);
    } catch {
      return -1;
    }
    if (url.origin !== location.origin) return -1;
    return routes.indexOf(normalizePath(url.pathname));
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setActive(index, { push: true, scroll: true }));
  });

  arrows.forEach((arrow) => {
    arrow.addEventListener('click', () => {
      if (arrow.disabled) return;
      setActive(activeIndex + Number(arrow.dataset.featureDirection || 0), { push: true, scroll: true });
    });
  });

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest('a[href]');
    if (!link) return;
    const index = indexFromHref(link.href);
    if (index < 0) return;
    event.preventDefault();
    setActive(index, { push: true, scroll: true });
  });

  addEventListener('popstate', () => {
    const index = routes.indexOf(normalizePath(location.pathname));
    setActive(index >= 0 ? index : 0);
  });

  function updateArrowVisibility() {
    document.body.classList.toggle('is-workflow-switcher-visible', scrollY > 420);
  }

  addEventListener('scroll', updateArrowVisibility, { passive: true });
  setActive(activeIndex);
  updateArrowVisibility();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConnectedFeatureWorkflow);
} else {
  initConnectedFeatureWorkflow();
}
