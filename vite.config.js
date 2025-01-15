import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/',
  base: './',
  server: {
    hmr: true
  },
  build: {
    outDir: './',
    emptyOutDir: false,
  },
});
  