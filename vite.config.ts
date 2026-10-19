import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative base so the build works on GitHub Pages (/<repo>/) or any static host.
  base: './',
  server: { port: 5173 },
});
