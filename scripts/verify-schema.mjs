import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const pages = JSON.parse(readFileSync('src/data/pageSchema.json', 'utf8'));
const articleSlugs = [
  'from-artwork-to-production-a-better-promotional-product-proofing-workflow',
  'how-promotional-product-mockup-software-speeds-up-client-approvals',
  'what-is-an-artwork-proof-in-promotional-products',
];
const paths = [...Object.keys(pages), ...articleSlugs.map((slug) => `/insights/${slug}`)];
const expectedHeadings = {
  '/features': 'Features that keep every handoff connected.',
  '/features/product-catalog-integration': 'Search supplier catalogs. Start your mockup in one click.',
  '/features/online-mockup-designer': 'Online mockup software for promotional products',
  '/features/artwork-version-control': 'Artwork version control for promotional product proofs',
  '/features/customer-approval-portal': 'Artwork approval software for promotional products',
  '/features/centralized-project-workspace': 'One project workspace for every promo order',
  '/features/team-collaboration': 'Team collaboration for promotional product distributors',
  '/features/workflow-progress-dashboard': 'Artwork workflow dashboard for promo teams',
  '/features/production-ready-file-generation': 'Production-ready artwork files, generated after approval',
  '/industries': 'Distributors, suppliers, and decorators connected by one approval workflow.',
  '/pricing': 'Simple pricing for promo mockups and approvals',
  '/contact': 'Talk with the PromoPlus team.',
  '/insights': 'Promo product proofing and approval insights',
  '/insights/from-artwork-to-production-a-better-promotional-product-proofing-workflow': 'From Artwork to Production: A Better Promotional Product Proofing Workflow',
  '/insights/how-promotional-product-mockup-software-speeds-up-client-approvals': 'How Promotional Product Mockup Software Speeds Up Client Approvals',
  '/insights/what-is-an-artwork-proof-in-promotional-products': 'What Is an Artwork Proof in Promotional Products?',
};
let checked = 0;

const decodeHtml = (value) => value
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#(?:39|x27);/gi, "'")
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>');
const pageText = (value) => decodeHtml(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

for (const path of paths) {
  const file = join('dist', path === '/' ? '' : path.slice(1), 'index.html');
  const html = readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter((match) => /type="application\/ld\+json"/.test(match[1]))
    .map((match) => JSON.parse(match[2]));
  const nodes = scripts.flatMap((script) => script['@graph'] || [script]);
  const page = nodes
    .find((node) => ['WebPage', 'CollectionPage', 'ContactPage'].includes(node['@type']));
  if (!page) throw new Error(`${path}: missing page schema`);
  if (!scripts.length) throw new Error(`${path}: no JSON-LD`);
  if (expectedHeadings[path]) {
    const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
    if (headings.length !== 1 || pageText(headings[0][1]) !== expectedHeadings[path]) {
      throw new Error(`${path}: expected one matching H1: ${expectedHeadings[path]}`);
    }
    const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    if (decodeHtml(title || '') !== page.name || decodeHtml(description || '') !== page.description) {
      throw new Error(`${path}: title or meta description differs from page schema`);
    }
  }
  if (!html.includes(`<link rel="canonical" href="${page.url}"`)) {
    throw new Error(`${path}: canonical does not match schema URL ${page.url}`);
  }
  if (path === '/insights') {
    const list = nodes.find((node) => node['@type'] === 'ItemList');
    const cardUrls = [...html.matchAll(/<a class="story-card" href="([^"]+)"/g)]
      .map((match) => new URL(match[1], 'https://promoplus.io').href);
    const listedUrls = list?.itemListElement.map((item) => item.url) || [];
    if (cardUrls.length !== listedUrls.length || cardUrls.some((url, index) => url !== listedUrls[index])) {
      throw new Error(`${path}: ItemList must match the visible article cards`);
    }
  }
  if (path.startsWith('/insights/')) {
    const article = nodes.find((node) => node['@type'] === 'BlogPosting');
    const heading = pageText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] || '');
    if (!article || article.headline !== heading ||
        article.mainEntityOfPage?.['@id'] !== page['@id'] || !article.datePublished) {
      throw new Error(`${path}: BlogPosting must match the article and its page`);
    }
  }
  const faq = nodes.find((node) => node['@type'] === 'FAQPage');
  const shouldHaveFaq = path === '/' || path === '/pricing' ||
    path.startsWith('/industries/promotional-products-') || path.startsWith('/features/');
  if (Boolean(faq) !== shouldHaveFaq) throw new Error(`${path}: unexpected FAQ state`);
  if ((path === '/' || path === '/pricing' || path.startsWith('/features')) &&
      !nodes.some((node) => node['@type'] === 'SoftwareApplication')) {
    throw new Error(`${path}: missing SoftwareApplication`);
  }
  if (faq) {
    const htmlWithoutScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, ' ');
    const sections = [...htmlWithoutScripts.matchAll(/<section\b([^>]*)data-schema-faq([^>]*)>([\s\S]*?)<\/section>/g)];
    const activeSection = sections.find((match) => !/\bhidden\b/.test(match[1] + match[2]));
    if ((path === '/pricing' || path.startsWith('/features/')) && !activeSection) {
      throw new Error(`${path}: matching visible FAQ section is missing`);
    }
    const visibleText = pageText(activeSection ? activeSection[3] : htmlWithoutScripts);
    for (const question of faq.mainEntity) {
      if (!visibleText.includes(question.name) || !visibleText.includes(question.acceptedAnswer.text)) {
        throw new Error(`${path}: FAQ text does not match the rendered page: ${question.name}`);
      }
    }
  }
  if (html.includes('REPLACE_WITH_')) throw new Error(`${path}: placeholder detected`);
  checked += 1;
}

console.log(`Verified JSON-LD, visible FAQ text, SEO headings, metadata, and canonical URLs on ${checked} pages.`);
