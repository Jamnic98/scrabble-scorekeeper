import express from 'express'

import { connectDB } from './db.js'
import gamesRouter from './routes/games.route.js'

const app = express()
const PORT = process.env.PORT ?? 8080

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', gamesRouter)

async function start() {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
