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
  // FAQ markup is added separately only where matching questions are visible.
  graph['@graph'] = graph['@graph'].filter((node) => node['@type'] !== 'FAQPage');
  pages[url.replace('https://promoplus.io', '').replace(/\/$/, '') || '/'] = graph;
}

// The homepage copy was updated after the source schema document was prepared.
const homepage = pages['/']['@graph'].find((node) => node['@type'] === 'WebPage');
homepage.name = 'Artwork Approval Software for Promotional Products | PromoPlus';
homepage.description = 'Create promotional product mockups, get client artwork approvals, and send production-ready proofs in one place. Start your 30-day free trial.';

writeFileSync('src/data/pageSchema.json', `${JSON.stringify(pages, null, 2)}\n`);
console.log(`Imported ${Object.keys(pages).length} page graphs into src/data/pageSchema.json`);
