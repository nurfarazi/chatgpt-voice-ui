import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';

import manifest from './src/manifest';

const DEV_HOST = process.env.HMR_HOST ?? 'localhost';
const DEV_PORT = Number(process.env.HMR_PORT ?? 5173);
const DEV_PROTOCOL = process.env.HMR_PROTOCOL ?? 'ws';

export default defineConfig({
  plugins: [
    react(),
    crx({
      manifest,
      browser: 'chrome',
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'entries/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  server: {
    host: DEV_HOST,
    strictPort: true,
    hmr: {
      host: DEV_HOST,
      clientHost: DEV_HOST,
      port: DEV_PORT,
      clientPort: DEV_PORT,
      protocol: DEV_PROTOCOL,
    },
    origin: `${DEV_PROTOCOL}://${DEV_HOST}:${DEV_PORT}`,
    port: DEV_PORT,
    watch: {
      usePolling: process.env.HMR_USE_POLLING === 'true',
    },
    cors: {
      origin: '*',
      methods: ['GET', 'OPTIONS'],
      allowedHeaders: ['*'],
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  },
});
