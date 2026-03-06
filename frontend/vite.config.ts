import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    strictPort: true,
    port: 5173,
    watch: {
      usePolling: true, //<---Biar Hot reload nye jalan di wsl
    },
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://backend:5000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: process.env.VITE_API_TARGET || 'http://backend:5000',
        changeOrigin: true,
        secure: false,
        // Fix: Hapus helmet security headers yang block image loading
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            delete proxyRes.headers['cross-origin-resource-policy'];
            delete proxyRes.headers['cross-origin-embedder-policy'];
            delete proxyRes.headers['cross-origin-opener-policy'];
          });
          proxy.on('error', (err) => {
            console.error('[Vite Proxy /uploads] Error:', err.message);
          });
        },
      },
    },
  },
});
