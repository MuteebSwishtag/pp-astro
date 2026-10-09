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

// The feature-page SEO copy adds these confirmed answers after the original
// schema document. Keep the visible FAQ and JSON-LD sourced from the same data.
const confirmedFaqAdditions = {
  '/features/product-catalog-integration': [
    ['How can I search supplier products?', 'Search integrated supplier catalogs by vendor name, SKU or product keyword.', 'Do I need to download product images?'],
    ["Can I add a product that isn't in a catalog?", 'Yes. You can add a product manually to a PromoPlus project when it is not in a supplier catalog.', 'How can I search supplier products?'],
  ],
  '/features/online-mockup-designer': [
    ['What artwork files can I upload?', 'PromoPlus currently accepts SVG artwork files for the mockup designer.', 'Do I need Adobe Illustrator to make a mockup?'],
  ],
  '/features/artwork-version-control': [
    ['Is the approved version locked?', 'Yes. The approved version is locked against further edits.', 'How do I know which version the customer approved?'],
  ],
  '/features/customer-approval-portal': [
    ['Does the customer need an account?', 'No. Anyone with the shared link and access code can view and approve the mockup without a PromoPlus account.', 'How does a customer approve a mockup?'],
    ['Does PromoPlus send email notifications for review activity?', 'Yes. PromoPlus sends email notifications when a customer comments, requests a revision, or approves a mockup.', 'Is every approval recorded?'],
  ],
  '/features/centralized-project-workspace': [
    ['Can I stop searching emails and shared folders for project files?', 'That is the purpose. Files, comments and decisions live in one record instead of across inboxes.', 'Does the product from the catalog stay attached to the project?'],
    ['Is customer information stored in the project?', "Yes. The project stores the customer's name and email address.", 'Can I stop searching emails and shared folders for project files?'],
  ],
  '/features/team-collaboration': [
    ['Can remote production partners work in the project?', 'Yes. You can add an outside production partner as an advisor to coordinate in the project.', 'Do all roles see the same information?'],
  ],
  '/features/workflow-progress-dashboard': [
    ['Who can see the dashboard?', 'Owners and team members can access the dashboard, but their views differ.', 'How do I spot blocked work?'],
  ],
  '/features/production-ready-file-generation': [
    ['What is in the production PDF?', 'Two pages: the approved product proof and an artwork inspection page, with placement details and the decision record.', 'When is the production file generated?'],
  ],
};
for (const [path, additions] of Object.entries(confirmedFaqAdditions)) {
  const faq = pages[path]['@graph'].find((node) => node['@type'] === 'FAQPage');
  for (const [name, answer, after] of additions) {
    if (faq.mainEntity.some((question) => question.name === name)) continue;
    const afterIndex = faq.mainEntity.findIndex((question) => question.name === after);
    if (afterIndex < 0) throw new Error(`Missing FAQ insertion point for ${path}: ${after}`);
    faq.mainEntity.splice(afterIndex + 1, 0, {
      '@type': 'Question',
      name,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    });
  }
}

writeFileSync('src/data/pageSchema.json', `${JSON.stringify(pages, null, 2)}\n`);
console.log(`Imported ${Object.keys(pages).length} page graphs into src/data/pageSchema.json`);
