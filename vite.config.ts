import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Django в разработке слушает 8000, Vite — 5173/3000.
// Прокси позволяет проверять API и вход без отдельного домена.
const DJANGO = process.env.DJANGO_ORIGIN ?? 'http://127.0.0.1:8000';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    proxy: {
      '/api': { target: DJANGO, changeOrigin: true },
      '/login': { target: DJANGO, changeOrigin: true },
      '/register': { target: DJANGO, changeOrigin: true },
      '/demo-login': { target: DJANGO, changeOrigin: true },
      '/logout': { target: DJANGO, changeOrigin: true },
      '/manifest.webmanifest': { target: DJANGO, changeOrigin: true },
      '/static/web': { target: DJANGO, changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
  },
  // Сначала TS/TSX: в репозитории больше не должно быть скомпилированных .js рядом с исходниками
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
});
