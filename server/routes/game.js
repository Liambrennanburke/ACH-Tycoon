import { Router } from 'express'

const router = Router()

const scores = []

router.post('/save', (req, res) => {
  const { score, stats } = req.body
  scores.push({ score, stats, timestamp: Date.now() })
  res.json({ success: true })
})

router.get('/leaderboard', (req, res) => {
  const sorted = [...scores]
    .sort((a, b) => (b.score?.totalProcessed || 0) - (a.score?.totalProcessed || 0))
    .slice(0, 10)
  res.json(sorted)
})

export default router
