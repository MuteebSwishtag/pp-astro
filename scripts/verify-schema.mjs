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

for (const path of paths) {
  const file = join('dist', path === '/' ? '' : path.slice(1), 'index.html');
  const html = readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter((match) => /type="application\/ld\+json"/.test(match[1]))
    .map((match) => JSON.parse(match[2]));
  const page = scripts.flatMap((script) => script['@graph'] || [script])
    .find((node) => ['WebPage', 'CollectionPage', 'ContactPage'].includes(node['@type']));
  if (!page) throw new Error(`${path}: missing page schema`);
  if (!scripts.length) throw new Error(`${path}: no JSON-LD`);
  if (!html.includes(`<link rel="canonical" href="${page.url}"`)) {
    throw new Error(`${path}: canonical does not match schema URL ${page.url}`);
  }
  const faq = scripts.flatMap((script) => script['@graph'] || [script])
    .find((node) => node['@type'] === 'FAQPage');
  const shouldHaveFaq = path === '/' || path.startsWith('/industries/promotional-products-');
  if (Boolean(faq) !== shouldHaveFaq) throw new Error(`${path}: unexpected FAQ state`);
  if (html.includes('REPLACE_WITH_')) throw new Error(`${path}: placeholder detected`);
  checked += 1;
}

console.log(`Verified JSON-LD and canonical URLs on ${checked} pages.`);
