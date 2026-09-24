(() => {
  const API_URL = 'https://dei.bcv.mybluehost.me/website_27c75ff3/wp-json/wp/v2/posts?per_page=100';
  const FALLBACK_POSTS = window.PROMOPLUS_BLOG_POSTS || [];
  const storyGrid = document.querySelector('#storyGrid');
  const timestamp = document.querySelector('#liveTimestamp');
  const heroPulse = document.querySelector('#heroPulse');
  const pipelineHealth = document.querySelector('#pipelineHealth');
  const activityStage = document.querySelector('#activityStage');
  const activityList = document.querySelector('#liveActivity');
  const metricNodes = [...document.querySelectorAll('[data-live-number]')];
  const ageNodes = [...document.querySelectorAll('[data-live-age]')];

  const activityItems = [
    ['Approval', 'Retail opening staff hoodie approved for production.'],
    ['Artwork', 'Version 3 locked for the conference travel mug.'],
    ['Catalog', 'Drinkware shortlist added to Northline event project.'],
    ['Mockup', 'Front placement generated for the Custom Hoodie Campaign.'],
    ['Production', 'Approved PDF exported with placement and timestamp.'],
    ['Team', 'Operations tagged design on a source-file question.'],
  ];
  const postImages = [
    '/assets/features/approval-portal/approval-feedback.png',
    '/assets/features/workflow-dashboard/dashboard-hero.png',
    '/assets/features/catalog/catalog-search-buyer.png',
    '/assets/features/mockup-workflow-hands.png',
    '/assets/features/version-control/version-comparison.png',
    '/assets/features/production-files/production-handoff.png',
  ];
  const imageBySlug = {
    'how-promotional-product-mockup-software-speeds-up-client-approvals': '/assets/features/approval-portal/approval-feedback.png',
    'hello-world': '/assets/features/workflow-dashboard/dashboard-hero.png',
  };

  function formatTime(date) {
    return new Intl.DateTimeFormat([], {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }

  function updateTimestamp() {
    if (!timestamp) return;
    const now = new Date();
    timestamp.dateTime = now.toISOString();
    timestamp.textContent = formatTime(now);
  }

  function updateMetrics() {
    const minute = new Date().getMinutes();
    metricNodes.forEach((node, index) => {
      const base = Number(node.dataset.liveNumber || 0);
      node.textContent = String(base + ((minute + index) % 3));
    });
    if (heroPulse) heroPulse.textContent = `${12 + (minute % 4)} projects need attention`;
    if (pipelineHealth) pipelineHealth.textContent = `${74 + (minute % 5)}% clear`;
  }

  function updateActivity() {
    if (!activityList) return;
    const offset = Math.floor(Date.now() / 5000) % activityItems.length;
    const visible = [0, 1, 2].map((step) => activityItems[(offset + step) % activityItems.length]);
    activityList.innerHTML = visible.map(([stage, text], index) => (
      `<li><span>${stage}</span><strong>${text}</strong><small>${index === 0 ? 'Now' : `${index * 3 + 1}m ago`}</small></li>`
    )).join('');
    if (activityStage) activityStage.textContent = visible[0][0];
  }

  function updateAges() {
    const drift = Math.floor(Date.now() / 60000) % 4;
    ageNodes.forEach((node) => {
      const base = Number(node.dataset.liveAge || 1);
      node.textContent = `${base + drift} min ago`;
    });
  }

  function decodeHtml(value = '') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
  }

  function stripHtml(value = '') {
    const template = document.createElement('template');
    template.innerHTML = value;
    return template.content.textContent.replace(/\s+/g, ' ').trim();
  }

  function escapeHtml(value = '') {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }

  function formatDate(value) {
    if (!value) return 'Live feed';
    return new Intl.DateTimeFormat([], { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  }

  function readingTime(post) {
    const words = stripHtml(post.content?.rendered || '').split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.ceil(words / 220))} min read`;
  }

  async function fetchPosts() {
    try {
      const response = await fetch(API_URL, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`WordPress API returned ${response.status}`);
      const posts = await response.json();
      return Array.isArray(posts) && posts.length ? posts : FALLBACK_POSTS;
    } catch (error) {
      console.warn('Using local PromoPlus blog fallback:', error);
      return FALLBACK_POSTS;
    }
  }

  function getPostImage(post, index) {
    return post.jetpack_featured_media_url || imageBySlug[post.slug] || postImages[index % postImages.length];
  }

  function getPostUrl(slug) {
    return `/insights/${encodeURIComponent(slug || '')}/`;
  }

  function renderPostCards(posts) {
    if (!storyGrid || !posts.length) return;
    storyGrid.innerHTML = posts.map((post, index) => {
      const title = decodeHtml(post.title?.rendered || 'PromoPlus insight');
      const excerpt = stripHtml(post.excerpt?.rendered || post.content?.rendered || '').slice(0, 165);
      const safeTitle = escapeHtml(title);
      const safeExcerpt = escapeHtml(excerpt);
      return `
        <a class="story-card" href="${getPostUrl(post.slug)}">
          <figure><img src="${escapeHtml(getPostImage(post, index))}" alt="${safeTitle}"></figure>
          <div>
            <small>PromoPlus insight</small>
            <h3>${safeTitle}</h3>
            <p>${safeExcerpt}</p>
            <span>${formatDate(post.date)} &middot; ${readingTime(post)}</span>
            <b class="story-cta">Read insight <i>&nearr;</i></b>
          </div>
        </a>
      `;
    }).join('');
  }

  function tick() {
    updateTimestamp();
    updateMetrics();
    updateAges();
  }

  tick();
  updateActivity();
  fetchPosts().then(renderPostCards);
  setInterval(tick, 1000);
  setInterval(updateActivity, 5000);
})();
