import { appendFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'

function debugLogPlugin(): Plugin {
  return {
    name: 'temporary-debug-log',
    configureServer(server) {
      server.middlewares.use('/__debug-log', (request, response) => {
        let body = ''
        request.on('data', (chunk) => {
          body += chunk
        })
        request.on('end', () => {
          try {
            const entry = JSON.parse(body)
            // #region agent log
            appendFileSync('/opt/cursor/logs/debug.log', `${JSON.stringify(entry)}\n`)
            // #endregion
            response.statusCode = 204
          } catch {
            response.statusCode = 400
          }
          response.end()
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), debugLogPlugin()],
  // Le port est ici et pas seulement dans `.claude/launch.json` : c'est celui que
  // le README annonce, il doit donc valoir pour un `pnpm dev` nu.
  server: { port: 5190 },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  }
})
