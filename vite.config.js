import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src/',
  base: '/CannonJsWorld/',
  server: {
    hmr: true
  },
  build: {
    outDir: 'dist',
  },
});
  