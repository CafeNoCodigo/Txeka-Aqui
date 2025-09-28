import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // porta do backend Express local
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // remove /api para bater com a rota do backend
      },
    },
  },
});