import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import plaidRoutes from './routes/plaid.js'
import gameRoutes from './routes/game.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())

app.use(express.json())

app.use('/api/plaid', plaidRoutes)
app.use('/api/game', gameRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.listen(PORT, () => {
  console.log(`ACH Tycoon server running on port ${PORT}`)
})
