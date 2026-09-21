import { defineConfig } from 'astro/config';

export default defineConfig({
  build: {
    format: 'preserve'
  },
  vite: {
    tsconfig: './tsconfig.json'
  }
});

