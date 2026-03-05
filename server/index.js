import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import plaidRoutes from './routes/plaid.js'
import gameRoutes from './routes/game.js'

const app = express()
const PORT = process.env.PORT || 3001

const allowedOrigins = [
  'http://localhost:5173',
  'https://achtycoon.com',
  'https://www.achtycoon.com',
  process.env.CORS_ORIGIN,
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true)
    else cb(null, true)
  },
  credentials: true,
}))

app.use(express.json())

app.use('/api/plaid', plaidRoutes)
app.use('/api/game', gameRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.listen(PORT, () => {
  console.log(`ACH Tycoon server running on port ${PORT}`)
})
