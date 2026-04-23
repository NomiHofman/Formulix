import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Embeds favicon as data-URI so the tab icon loads with the HTML (no separate /favicon.svg request). */
function inlineSvgFavicon() {
  return {
    name: 'inline-svg-favicon',
    transformIndexHtml(html) {
      try {
        const svg = readFileSync(join(__dirname, 'public', 'favicon.svg'), 'utf-8');
        const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
        return html.replace(
          /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg" \/>/,
          `<link rel="icon" type="image/svg+xml" href="${dataUri}" />`,
        );
      } catch {
        return html;
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineSvgFavicon()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('recharts')) return 'recharts';
          if (id.includes('framer-motion')) return 'framer';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor';
        },
      },
    },
  },
});
