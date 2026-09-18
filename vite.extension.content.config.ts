import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))

/** Content script : un seul fichier IIFE, sans `import` vers des chunks. */
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
      '@/i18n': resolve(root, 'extension/i18n-stub.ts')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    outDir: 'dist-extension',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(root, 'extension/content.ts'),
      output: {
        format: 'iife',
        name: 'AnimateBotContent',
        entryFileNames: 'content.js',
        inlineDynamicImports: true
      }
    }
  }
})
