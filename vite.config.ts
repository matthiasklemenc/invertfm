import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// GitHub Pages base URL for this repo
const GITHUB_BASE = '/invertfm/';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    // Ensures assets load correctly on GitHub Pages
    base: GITHUB_BASE,

    // Build output to /docs so GitHub Pages can serve it
    build: {
      outDir: 'docs',
      emptyOutDir: true, // (recommended) clears old files before building
    },

    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    plugins: [react()],

    define: {
      // Expose environment variables safely
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY ?? ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY ?? ''),

      // Optional utility if you want to access base path
      __APP_BASE__: JSON.stringify(GITHUB_BASE),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
