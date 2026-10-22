import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const namespace = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const decode = (value) => value.replace(/&(?:amp|quot|apos|lt|gt);|&#(?:x[\da-f]+|\d+);/gi, (entity) => {
  const named = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' };
  return named[entity.toLowerCase()] ?? String.fromCodePoint(
    entity[2].toLowerCase() === 'x' ? parseInt(entity.slice(3), 16) : parseInt(entity.slice(2), 10),
  );
});
const escapeXml = (value) => value.replace(/[&<>"']/g, (character) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[character]
));
const attributes = (tag) => Object.fromEntries(
  [...tag.matchAll(/([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map((match) => [match[1].toLowerCase(), decode(match[2] ?? match[3])]),
);
const normalizePath = (pathname) => decodeURIComponent(pathname).replace(/\/$/, '') || '/';

async function collectPages(directory, site) {
  const urls = new Set();
  const excluded = [];
  async function visit(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = join(folder, entry.name);
      if (entry.isDirectory()) {
        await visit(file);
        continue;
      }
      if (!entry.name.endsWith('.html')) continue;
      const path = `/${relative(directory, file).split(sep).join('/')}`.replace(/index\.html$/, '');
      const html = await readFile(file, 'utf8');
      const head = (html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '')
        .replace(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
      const meta = [...head.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => attributes(tag));
      const blocked = meta.some((tag) => (
        /^(robots|googlebot)$/i.test(tag.name || '') && /\b(noindex|none)\b/i.test(tag.content || '')
      ) || /^refresh$/i.test(tag['http-equiv'] || ''));
      const canonicals = [...head.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attributes(tag))
        .filter((tag) => /(?:^|\s)canonical(?:\s|$)/i.test(tag.rel || ''));
      if (blocked || !canonicals.length) {
        excluded.push(`${path} (${blocked ? 'noindex or redirect' : 'no canonical'})`);
        continue;
      }
      if (canonicals.length !== 1) throw new Error(`${path}: expected exactly one canonical URL`);
      const canonical = new URL(canonicals[0].href);
      if (canonical.origin !== new URL(site).origin || normalizePath(canonical.pathname) !== normalizePath(path)) {
        excluded.push(`${path} (canonical points elsewhere)`);
        continue;
      }
      if (canonical.protocol !== 'https:' || canonical.search || canonical.hash) {
        throw new Error(`${path}: invalid sitemap canonical ${canonical.href}`);
      }
      if (urls.has(canonical.href)) throw new Error(`Duplicate canonical URL: ${canonical.href}`);
      urls.add(canonical.href);
    }
  }
  await visit(directory);
  if (!urls.size) throw new Error('No canonical pages found for the sitemap');
  return { urls: [...urls].sort(), excluded: excluded.sort() };
}

async function sitemap(directory, site, check = false) {
  const { urls, excluded } = await collectPages(directory, site);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${namespace}">\n`
    + urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')
    + '\n</urlset>\n';
  const file = join(directory, 'sitemap.xml');
  const robots = await readFile(join(directory, 'robots.txt'), 'utf8');
  const sitemapUrl = new URL('/sitemap.xml', site).href;
  if (!robots.split(/\r?\n/).some((line) => line.trim() === `Sitemap: ${sitemapUrl}`)) {
    throw new Error(`robots.txt must reference ${sitemapUrl}`);
  }
  if (check) {
    if (await readFile(file, 'utf8') !== xml) {
      throw new Error('Sitemap differs from the canonical, indexable built pages. Run npm run build.');
    }
  } else {
    await writeFile(file, xml, 'utf8');
  }
  return { count: urls.length, excluded };
}

// Run after rendering so fetched articles and their actual canonicals are included.
export function canonicalSitemap() {
  let site;
  return {
    name: 'canonical-sitemap',
    hooks: {
      'astro:config:done': ({ config }) => { site = config.site; },
      'astro:build:done': async ({ dir, logger }) => {
        const { count, excluded } = await sitemap(fileURLToPath(dir), site);
        logger.info(`Generated sitemap.xml with ${count} canonical URLs.`);
        if (excluded.length) logger.info(`Excluded: ${excluded.join(', ')}`);
      },
    },
  };
}

export async function verifySitemap(directory, site) {
  const { count, excluded } = await sitemap(directory, site, true);
  console.log(`Verified ${count} canonical sitemap URLs and robots.txt. Excluded ${excluded.length} noncanonical/noindex pages.`);
}
