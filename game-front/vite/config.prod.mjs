import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    base: './',
    plugins: [
        react(),
        tailwindcss()
    ],
    logLevel: 'warning',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
        minify: 'terser',
        terserOptions: {
            compress: {
                passes: 2
            },
            mangle: true,
            format: {
                comments: false
            }
        },
        outDir: 'build',
    },
    resolve: {
		alias: {
			'@': fileURLToPath(new URL('../src', import.meta.url)),
			buffer: 'buffer/',
			process: 'process/browser',
			stream: 'stream-browserify',
		},
	},
});
