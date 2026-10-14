import { execSync } from 'node:child_process';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Nomor versi yang tampil di kaki halaman, supaya mudah tahu versi mana yang sedang dibuka
function appVersion() {
  const date = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'medium', timeStyle: 'short' });
  try {
    return `${date} WIB · ${execSync('git rev-parse --short HEAD').toString().trim()}`;
  } catch {
    return `${date} WIB`;
  }
}

export default defineConfig({
  plugins: [react()],
  // Path relatif supaya hasil build bisa dibuka di GitHub Pages
  // (https://<username>.github.io/buy-or-maintain/)
  base: './',
  define: { __APP_VERSION__: JSON.stringify(appVersion()) },
  build: { chunkSizeWarningLimit: 900 }, // Recharts cukup besar; aman untuk aplikasi ini
});
