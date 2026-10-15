import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/targets/**'],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/')) return 'three';
          if (id.includes('/node_modules/three-globe/')) return 'three-globe';
          if (id.includes('/node_modules/globe.gl/')) return 'globe';
          if (id.includes('/node_modules/react')) return 'react';
        },
      },
    },
  },
});
