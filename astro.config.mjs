import { defineConfig } from 'astro/config';
import { canonicalSitemap } from './scripts/sitemap.mjs';

export default defineConfig({
  site: 'https://promoplus.io',
  integrations: [canonicalSitemap()],
  build: {
    format: 'directory'
  },
  vite: {
    tsconfig: './tsconfig.json'
  }
});

