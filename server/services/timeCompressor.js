const TOTAL_GAME_SECONDS = 45 * 60

export function compressTimeline(transactions) {
  if (transactions.length === 0) return {}

  const dates = transactions.map((t) => new Date(t.date).getTime())
  const minDate = Math.min(...dates)
  const maxDate = Math.max(...dates)
  const realSpan = maxDate - minDate || 1

  const dateCounts = {}
  transactions.forEach((t) => {
    dateCounts[t.date] = (dateCounts[t.date] || 0) + 1
  })

  const timeMap = {}
  const uniqueDates = [...new Set(transactions.map((t) => t.date))].sort()

  uniqueDates.forEach((date) => {
    const realTime = new Date(date).getTime()
    const normalized = (realTime - minDate) / realSpan
    const gameSeconds = applyAccelerationCurve(normalized) * TOTAL_GAME_SECONDS
    timeMap[date] = gameSeconds
  })

  return timeMap
}

function applyAccelerationCurve(t) {
  // Gentle start, aggressive late-game compression.
  // ~1700 txns over 2700s: early ~1 per 4-5s, mid ~1 per 2s, late ~2-4 per second.
  return t * t * 0.5 + t * 0.5
}
