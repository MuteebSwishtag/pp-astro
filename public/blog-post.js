(() => {
  const API_URL = 'https://dei.bcv.mybluehost.me/website_27c75ff3/wp-json/wp/v2/posts?per_page=100';
  const FALLBACK_POSTS = window.PROMOPLUS_BLOG_POSTS || [];
  const ASSET_BY_SLUG = {
    'how-promotional-product-mockup-software-speeds-up-client-approvals': 'assets/features/approval-portal/approval-feedback.png',
    'hello-world': 'assets/features/workflow-dashboard/dashboard-hero.png',
  };
  const DEFAULT_IMAGES = [
    'assets/features/workflow-dashboard/dashboard-hero.png',
    'assets/features/catalog/catalog-search-buyer.png',
    'assets/features/mockup-workflow-hands.png',
    'assets/features/approval-portal/approval-feedback.png',
    'assets/features/version-control/version-comparison.png',
    'assets/features/production-files/production-handoff.png',
  ];

  const $ = (selector) => document.querySelector(selector);

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

  function sanitizeContent(html = '') {
    const template = document.createElement('template');
    template.innerHTML = html;
    template.content.querySelectorAll('script,iframe,object,embed,style,link,form,input,button').forEach((node) => node.remove());
    template.content.querySelectorAll('*').forEach((node) => {
      [...node.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value.trim().toLowerCase();
        if (name.startsWith('on') || value.startsWith('javascript:')) node.removeAttribute(attr.name);
      });
    });
    return template.innerHTML.trim() || '<p class="blog-empty">This article does not have content yet.</p>';
  }

  function getSlugFromPath() {
    const params = new URLSearchParams(window.location.search);
    const querySlug = params.get('slug');
    if (querySlug) return querySlug;
    const parts = window.location.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || '';
    if (last === 'index.html') return parts[parts.length - 2] || '';
    if (!last || last === 'post.html') return '';
    return last.replace(/\.html$/, '');
  }

  function buildApiUrl(params = {}) {
    const url = new URL(API_URL);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    return url.toString();
  }

  async function fetchPosts() {
    try {
      const response = await fetch(buildApiUrl(), { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`WordPress API returned ${response.status}`);
      const posts = await response.json();
      return Array.isArray(posts) && posts.length ? posts : FALLBACK_POSTS;
    } catch (error) {
      console.warn('Using local PromoPlus blog fallback:', error);
      return FALLBACK_POSTS;
    }
  }

  async function fetchPostBySlug(slug) {
    if (!slug) return null;
    try {
      const response = await fetch(buildApiUrl({ slug }), { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`WordPress API returned ${response.status}`);
      const posts = await response.json();
      return Array.isArray(posts) && posts.length ? posts[0] : null;
    } catch (error) {
      console.warn('Using local PromoPlus blog slug fallback:', error);
      return FALLBACK_POSTS.find((post) => post.slug === slug) || null;
    }
  }

  function getPostImage(post, index = 0) {
    return post.jetpack_featured_media_url || ASSET_BY_SLUG[post.slug] || DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
  }

  function getPostUrl(slug) {
    return `post.html?slug=${encodeURIComponent(slug || '')}`;
  }

  function formatDate(value) {
    if (!value) return 'Live post';
    return new Intl.DateTimeFormat([], { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  }

  function readingTime(post) {
    const words = stripHtml(post.content?.rendered || '').split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.ceil(words / 220))} min read`;
  }

  function renderPost(post, posts) {
    const title = decodeHtml(post.title?.rendered || 'PromoPlus insight');
    const excerpt = stripHtml(post.excerpt?.rendered || post.content?.rendered || '');
    const image = getPostImage(post);
    document.title = `${title} | PromoPlus`;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', excerpt || title);
    $('#blogTitle').textContent = title;
    $('#blogExcerpt').textContent = excerpt || 'A PromoPlus workflow insight from the latest WordPress feed.';
    $('#blogDate').textContent = formatDate(post.date);
    $('#blogReadingTime').textContent = readingTime(post);
    $('#blogSource').textContent = `Post #${post.id}`;
    $('#blogStatus').textContent = post.status || 'Published';
    $('#blogSlug').textContent = `/${post.slug}/`;
    $('#blogImageLabel').textContent = title.length > 34 ? 'PromoPlus article' : title;
    $('#blogImage').src = image;
    $('#blogImage').alt = title;
    $('#blogContent').innerHTML = sanitizeContent(post.content?.rendered || '');
    renderRelated(posts.filter((item) => item.slug !== post.slug).slice(0, 2));
  }

  function renderRelated(posts) {
    const related = $('#relatedPosts');
    if (!related) return;
    related.innerHTML = posts.map((post, index) => {
      const title = decodeHtml(post.title?.rendered || 'PromoPlus insight');
      const excerpt = stripHtml(post.excerpt?.rendered || post.content?.rendered || '').slice(0, 150);
      const safeTitle = escapeHtml(title);
      const safeExcerpt = escapeHtml(excerpt);
      return `
        <a class="story-card" href="${getPostUrl(post.slug)}">
          <figure><img src="${escapeHtml(getPostImage(post, index + 1))}" alt="${safeTitle}"></figure>
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

  function renderNotFound(slug, posts) {
    $('#blogTitle').textContent = 'Insight not found';
    $('#blogExcerpt').textContent = `No WordPress post matched the slug "${slug}".`;
    $('#blogDate').textContent = 'No match';
    $('#blogReadingTime').textContent = 'Try another article';
    $('#blogStatus').textContent = 'Not found';
    $('#blogSlug').textContent = `/${slug || 'missing-slug'}/`;
    $('#blogContent').innerHTML = '<p class="blog-empty">The selected blog page could not find a matching post from the WordPress feed.</p>';
    renderRelated(posts.slice(0, 2));
  }

  async function init() {
    const slug = getSlugFromPath();
    const [posts, postBySlug] = await Promise.all([fetchPosts(), fetchPostBySlug(slug)]);
    const querySlug = new URLSearchParams(window.location.search).get('slug');
    const post = postBySlug || posts.find((item) => item.slug === slug) || posts.find((item) => item.slug === querySlug);
    if (post) renderPost(post, posts);
    else renderNotFound(slug, posts);
  }

  init();
})();
