import { fileURLToPath } from 'node:url';
import config from '../astro.config.mjs';
import { verifySitemap } from './sitemap.mjs';

await verifySitemap(fileURLToPath(new URL('../dist/', import.meta.url)), config.site);
