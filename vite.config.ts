import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],

        // GitHub Pages base path
        base: env.VITE_BASE_PATH || '/invertfm/?v=3/',

        resolve: {
            alias: {
                '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
            },
        },

        server: {
            host: true,
            port: 3000,
        },

        // IMPORTANT: Always build into /docs for GitHub Pages
        build: {
            outDir: 'docs',
            emptyOutDir: true,
        },
    };
});
