import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // Only scan the real app entry — keep the dep scanner out of the throwaway
  // sketches/*.html prototypes (some import three.js from a CDN).
  optimizeDeps: {
    entries: ['index.html'],
  },
});
