import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  // Use relative asset paths so the built site works under subpaths
  // (e.g. GitHub Pages) and when opened from different base URLs.
  base: './',
  server: {
    open: '/index.vite.html'
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.vite.html')
      }
    }
  }
});
