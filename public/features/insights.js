(() => {
  const API_URL = 'https://dei.bcv.mybluehost.me/website_27c75ff3/wp-json/wp/v2/posts?per_page=100';
  const FALLBACK_POSTS = window.PROMOPLUS_BLOG_POSTS || [];
  const storyGrid = document.querySelector('#storyGrid');
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
    'what-is-an-artwork-proof-in-promotional-products': '/assets/features/mockup-workflow-hands.png',
    'hello-world': '/assets/features/workflow-dashboard/dashboard-hero.png',
  };

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
      if (!Array.isArray(posts)) return FALLBACK_POSTS;
      return [...new Map([...FALLBACK_POSTS, ...posts].map((post) => [post.slug, post])).values()];
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

  fetchPosts().then(renderPostCards);
})();
