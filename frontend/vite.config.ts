import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: {
    // Use esbuild-wasm by setting the binary path
    jsxInject: `import React from 'react'`,
  },
  optimizeDeps: {
    esbuildOptions: {
      // Force esbuild to use WASM
      platform: 'browser',
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    // Don't ship source maps publicly in production
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        // Split vendor libraries into separate, long-cached chunks and
        // keep the main entry lean (avoids the >500 kB single-chunk warning).
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router') || id.includes('/scheduler/')) {
              return 'react';
            }
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n';
            if (id.includes('axios')) return 'axios';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('stripe-js')) return 'stripe';
            return 'vendor';
          }
        },
      },
    },
  },
})
