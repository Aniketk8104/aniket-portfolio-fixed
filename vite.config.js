import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const removeThreePreload = () => ({
  name: 'remove-three-preload',
  apply: 'build',
  transformIndexHtml(html) {
    return html.replace(/<link rel="modulepreload"[^>]*three-vendor[^>]*>\s*/g, '');
  },
});

export default defineConfig({
  plugins: [react(), removeThreePreload()],
  server: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'animation-vendor': ['framer-motion', 'gsap'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Robots-Tag': 'all',
    },
  },
});
