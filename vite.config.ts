export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],

        base: '/invertfm/',   // ✅ ALWAYS THIS

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
