import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [ ],
  base: '/swatches/', 
  server: {
    open: true,
  },
  build: {
    outDir: 'dist',
  },
});
