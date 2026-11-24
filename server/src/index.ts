import { connectDB } from './db.js'
import { createApp } from './app.js'

const PORT = process.env.PORT ?? 8080

async function start() {
  await connectDB()

  const app = createApp()

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
