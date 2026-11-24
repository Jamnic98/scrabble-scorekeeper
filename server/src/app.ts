import express from 'express'

import gamesRouter from './routes/games.route.js'

// Completed games carry a full history with a 15x15 boardState snapshot per
// move, so long games produce multi-MB JSON payloads. The express.json()
// default limit is 100kb, which rejects those saves with 413 — raise it
// (MongoDB's hard document cap is 16MB).
const JSON_BODY_LIMIT = '10mb'

export function createApp() {
  const app = express()

  app.use(express.json({ limit: JSON_BODY_LIMIT }))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/api', gamesRouter)

  return app
}
