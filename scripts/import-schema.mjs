// Import the page graphs from the supplied PromoPlus schema document.
// Usage: node scripts/import-schema.mjs "path/to/promoplus schema all pages.txt"
import { readFileSync, writeFileSync } from 'node:fs';

const source = readFileSync(process.argv[2], 'utf8').replace(/^\uFEFF/, '');
const blocks = [...source.matchAll(/Page: (https:\/\/promoplus\.io\/[^\r\n]*)\s*=+\s*<script type="application\/ld\+json">\s*(\{.*?\})\s*<\/script>/gs)];
if (blocks.length !== 19) throw new Error(`Expected 19 page graphs, found ${blocks.length}`);

const pages = {};
for (const [, url, rawJson] of blocks) {
  if (url.includes('/insights/') && url !== 'https://promoplus.io/insights/') continue;
  const graph = JSON.parse(rawJson);
  pages[url.replace('https://promoplus.io', '').replace(/\/$/, '') || '/'] = graph;
}

// The homepage copy was updated after the source schema document was prepared.
const homepage = pages['/']['@graph'].find((node) => node['@type'] === 'WebPage');
homepage.name = 'Artwork Approval Software for Promotional Products | PromoPlus';
homepage.description = 'Create promotional product mockups, get client artwork approvals, and send production-ready proofs in one place. Start your 30-day free trial.';

// Feature URLs are validated independently, so include the same application
// definition on each feature page as well as its reference from WebPage.about.
const software = pages['/']['@graph'].find((node) => node['@type'] === 'SoftwareApplication');
for (const [path, graph] of Object.entries(pages)) {
  if (!path.startsWith('/features')) continue;
  if (!graph['@graph'].some((node) => node['@type'] === 'SoftwareApplication')) {
    graph['@graph'].push(structuredClone(software));
  }
  if (path !== '/features' && !graph['@graph'].some((node) => node['@type'] === 'FAQPage')) {
    throw new Error(`Missing FAQPage for ${path}`);
  }
}
if (!pages['/pricing']['@graph'].some((node) => node['@type'] === 'FAQPage')) {
  throw new Error('Missing FAQPage for /pricing');
}

writeFileSync('src/data/pageSchema.json', `${JSON.stringify(pages, null, 2)}\n`);
console.log(`Imported ${Object.keys(pages).length} page graphs into src/data/pageSchema.json`);
