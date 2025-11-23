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
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
    },
  },
});
