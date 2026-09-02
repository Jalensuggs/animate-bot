import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))

/** Copie manifest et icones apres le build Rollup. */
function extensionAssets() {
  return {
    name: 'extension-assets',
    closeBundle() {
      const out = resolve(root, 'dist-extension')
      copyFileSync(resolve(root, 'extension/manifest.json'), resolve(out, 'manifest.json'))
      const iconsOut = resolve(out, 'icons')
      mkdirSync(iconsOut, { recursive: true })
      copyFileSync(resolve(root, 'extension/icons/icon.svg'), resolve(iconsOut, 'icon.svg'))
      const nestedPopup = resolve(out, 'extension/popup.html')
      const rootPopup = resolve(out, 'popup.html')
      if (existsSync(nestedPopup)) {
        const html = readFileSync(nestedPopup, 'utf8').replace(/\.\.\//g, './')
        writeFileSync(rootPopup, html)
      }
    }
  }
}

export default defineConfig({
  plugins: [vue(), extensionAssets()],
  base: './',
  publicDir: false,
  resolve: {
    alias: {
      '@': resolve(root, 'src'),
      '@/i18n': resolve(root, 'extension/i18n-stub.ts')
    }
  },
  build: {
    outDir: 'dist-extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(root, 'extension/content.ts'),
        popup: resolve(root, 'extension/popup.html'),
        background: resolve(root, 'extension/background.ts')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: '[name][extname]'
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  }
})
