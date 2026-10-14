import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Path relatif supaya hasil build bisa dibuka di GitHub Pages
  // (https://<username>.github.io/buy-or-maintain/)
  base: './',
  build: { chunkSizeWarningLimit: 900 }, // Recharts cukup besar; aman untuk aplikasi ini
});
