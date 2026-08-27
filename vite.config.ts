import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { runChat, type ChatRequestBody } from './api/_lib/chatCore.js'

// Serves POST /api/chat under plain `vite dev`, mirroring api/chat.ts, so local
// testing doesn't require `vercel dev` (which needs an interactive OAuth login).
// Only used in dev — production traffic hits the real Vercel function.
function localApiPlugin(): Plugin {
  return {
    name: 'local-api-chat',
    configureServer(server) {
      server.middlewares.use('/api/chat', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        let raw = ''
        req.on('data', (chunk) => { raw += chunk })
        req.on('end', async () => {
          let body: ChatRequestBody | undefined
          try {
            body = raw ? JSON.parse(raw) : undefined
          } catch {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid JSON body' }))
            return
          }
          const result = await runChat(body)
          res.statusCode = result.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result.body))
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Loaded here (not merged into import.meta.env) so ANTHROPIC_API_KEY reaches
  // the dev-only server plugin above without ever being exposed to client code.
  const env = loadEnv(mode, process.cwd(), '')
  if (env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY

  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
  }
})
