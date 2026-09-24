import { defineConfig } from 'astro/config';

export default defineConfig({
  build: {
    format: 'directory'
  },
  vite: {
    tsconfig: './tsconfig.json'
  }
});

