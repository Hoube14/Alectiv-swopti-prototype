import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/app/themes/glasonline/public/product-selector/',
  define: {
    // Cache-bust image URLs on each build so browsers and proxies fetch fresh assets
    __BUILD_TIME__: JSON.stringify(Date.now()),
  },
  plugins: [
    vue(),
    // Vue DevTools plugin can cause "Cannot read properties of null (reading 'tap')" when DOM/base path differs; disable if needed
    // vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'product-selector.js',
        chunkFileNames: 'product-selector-[name].js',
        assetFileNames: 'product-selector.[ext]'
      }
    }
  },
})