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
      },
    },
  },
});