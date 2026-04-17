import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
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

