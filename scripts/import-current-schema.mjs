// Import the authoritative per-page schema briefs. Existing unrelated pages stay intact.
// Usage: node scripts/import-current-schema.mjs .tmp
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const directory = process.argv[2] || '.tmp';
const pages = JSON.parse(readFileSync('src/data/pageSchema.json', 'utf8'));
const shared = JSON.parse(readFileSync('src/data/sharedSchema.json', 'utf8'));
const inputs = readdirSync(directory).filter((name) => /^schema-.*\.txt$/.test(name)).sort();
const imports = inputs.map((name) => {
  const text = readFileSync(join(directory, name), 'utf8');
  const url = text.match(/^URL:\s*(https:\/\/promoplus\.io\/\S*)/m)?.[1];
  const raw = text.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)?.[1];
  if (!url || !raw) throw new Error(`Missing URL or JSON-LD: ${name}`);
  const graph = JSON.parse(raw);
  if (!Array.isArray(graph['@graph'])) throw new Error(`Missing graph: ${name}`);
  return { path: new URL(url).pathname.replace(/\/$/, '') || '/', graph };
});

// Retain the visible pricing FAQ as content; the new pricing brief omits FAQ schema.
const oldPricingFaq = pages['/pricing']?.['@graph'].find((node) => node['@type'] === 'FAQPage');
if (oldPricingFaq) {
  writeFileSync('src/data/pricingFaqs.json', JSON.stringify(oldPricingFaq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]), null, 2) + '\n');
}
for (const { path, graph } of imports) {
  if (path === '/') {
    for (const node of graph['@graph']) {
      if (['Organization', 'WebSite', 'SoftwareApplication'].includes(node['@type'])) {
        shared[node['@type']] = node;
      }
    }
    const faq = graph['@graph'].find((node) => node['@type'] === 'FAQPage');
    if (faq) {
      writeFileSync('src/data/homeFaqs.ts', `export const homeFaqs = ${JSON.stringify(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]), null, 2)} as const;\n`);
    }
  }
  pages[path] = graph;
}
writeFileSync('src/data/pageSchema.json', JSON.stringify(pages, null, 2) + '\n');
writeFileSync('src/data/sharedSchema.json', JSON.stringify(shared, null, 2) + '\n');
console.log(`Imported ${imports.length} authoritative page graphs from ${directory}.`);
