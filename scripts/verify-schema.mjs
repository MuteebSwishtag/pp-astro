import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const pages = JSON.parse(readFileSync('src/data/pageSchema.json', 'utf8'));
const articleSlugs = [
  'from-artwork-to-production-a-better-promotional-product-proofing-workflow',
  'how-promotional-product-mockup-software-speeds-up-client-approvals',
  'what-is-an-artwork-proof-in-promotional-products',
];
const paths = [...Object.keys(pages), ...articleSlugs.map((slug) => `/insights/${slug}`)];
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
  if (!html.includes(`<link rel="canonical" href="${page.url}"`)) {
    throw new Error(`${path}: canonical does not match schema URL ${page.url}`);
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

console.log(`Verified JSON-LD types, visible FAQ text, and canonical URLs on ${checked} pages.`);
