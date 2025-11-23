import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],

        // GitHub Pages base
        base: '/invertfm/',

        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },

        server: {
            host: true,
            port: 3000,
        },

        build: {
            outDir: 'docs',
            emptyOutDir: true,
        },
    };
});
