const catalogData = {
  drinkware: { query: 'Insulated bottle', title: 'Vacuum Bottle 24 oz.', meta: 'SKU VB-240 · 12 colors' },
  apparel: { query: 'Performance shirt', title: 'Performance Tee', meta: 'SKU PT-150 · 18 colors' },
  bags: { query: 'Canvas tote', title: 'Everyday Canvas Tote', meta: 'SKU CT-320 · 8 colors' }
};

/* The category controls demonstrate connected catalog data without imitating a full product UI. */
function initCatalogPreview() {
  const scene = document.querySelector('[data-catalog-scene]');
  const buttons = [...document.querySelectorAll('.catalog-category-tabs button')];
  const preview = document.querySelector('.catalog-result-preview');
  const query = document.querySelector('#catalog-query');
  if (!scene || !buttons.length || !preview || !query) return;

  buttons.forEach((button) => button.addEventListener('click', () => {
    const item = catalogData[button.dataset.product];
    if (!item) return;
    buttons.forEach((control) => control.classList.toggle('is-active', control === button));
    preview.classList.add('is-changing');
    window.setTimeout(() => {
      query.value = item.query;
      preview.querySelector('strong').textContent = item.title;
      preview.querySelector('span').textContent = item.meta;
      preview.classList.remove('is-changing');
    }, reducedMotion ? 0 : 180);
  }));
}

/* Each step becomes active as its explanation reaches the reading zone. */
function initCatalogStory() {
  const steps = [...document.querySelectorAll('.catalog-story-steps li')];
  if (!steps.length || reducedMotion || !('IntersectionObserver' in window)) {
    steps.forEach((step) => step.classList.add('is-active'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) steps.forEach((step) => step.classList.toggle('is-active', step === entry.target));
    });
  }, { rootMargin: '-30% 0px -48%', threshold: 0.15 });
  steps.forEach((step) => observer.observe(step));
}

initCatalogPreview();
initCatalogStory();
