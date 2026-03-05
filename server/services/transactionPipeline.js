import { plaidClient } from './plaidClient.js'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function fetchAllTransactions(accessToken) {
  const now = new Date()
  const twoYearsAgo = new Date(now)
  twoYearsAgo.setFullYear(now.getFullYear() - 2)

  const startDate = twoYearsAgo.toISOString().split('T')[0]
  const endDate = now.toISOString().split('T')[0]

  // Retry loop — sandbox needs a few seconds after linking before transactions are ready
  const MAX_RETRIES = 5
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: startDate,
        end_date: endDate,
        options: { count: 500, offset: 0 },
      })

      let allTransactions = response.data.transactions
      const total = response.data.total_transactions

      while (allTransactions.length < total) {
        const page = await plaidClient.transactionsGet({
          access_token: accessToken,
          start_date: startDate,
          end_date: endDate,
          options: { count: 500, offset: allTransactions.length },
        })
        allTransactions = allTransactions.concat(page.data.transactions)
      }

      return processTransactions(allTransactions)
    } catch (err) {
      const code = err.response?.data?.error_code
      if (code === 'PRODUCT_NOT_READY' && attempt < MAX_RETRIES - 1) {
        console.log(`Transactions not ready, retrying in ${(attempt + 1) * 2}s... (attempt ${attempt + 1}/${MAX_RETRIES})`)
        await sleep((attempt + 1) * 2000)
        continue
      }
      throw err
    }
  }
}

export function processTransactions(transactions) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )

  const merchantCounts = {}
  sorted.forEach((t) => {
    const name = t.merchant_name || t.name || 'Unknown'
    merchantCounts[name] = (merchantCounts[name] || 0) + 1
  })

  const recurring = detectRecurring(sorted)
  const recurringIds = new Set(recurring.map((r) => r.transaction_id))

  const processed = sorted.map((t) => ({
    ...t,
    isRecurring: recurringIds.has(t.transaction_id),
    category: {
      primary: t.personal_finance_category?.primary || 'OTHER',
      detailed: t.personal_finance_category?.detailed || 'OTHER',
    },
  }))

  const amounts = processed.map((t) => Math.abs(t.amount))
  const dateCounts = {}
  processed.forEach((t) => {
    dateCounts[t.date] = (dateCounts[t.date] || 0) + 1
  })

  const busiestDay = Object.entries(dateCounts).sort((a, b) => b[1] - a[1])[0]
  const topMerchant = Object.entries(merchantCounts).sort((a, b) => b[1] - a[1])[0]

  const stats = {
    totalCount: processed.length,
    busiestDay: busiestDay ? `${busiestDay[0]} (${busiestDay[1]} txns)` : 'N/A',
    biggestAmount: Math.max(...amounts),
    smallestAmount: Math.min(...amounts),
    topMerchant: topMerchant ? `${topMerchant[0]} (${topMerchant[1]}x)` : 'N/A',
    totalVolume: amounts.reduce((s, a) => s + a, 0),
  }

  return { transactions: processed, stats }
}

function detectRecurring(sorted) {
  const byMerchant = {}
  sorted.forEach((t) => {
    const key = t.merchant_name || t.name || 'unknown'
    if (!byMerchant[key]) byMerchant[key] = []
    byMerchant[key].push(t)
  })

  const recurring = []
  for (const [merchant, txns] of Object.entries(byMerchant)) {
    if (txns.length < 3) continue

    const amounts = txns.map((t) => Math.abs(t.amount))
    const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length
    const amountVariance =
      amounts.reduce((s, a) => s + Math.pow(a - avgAmount, 2), 0) / amounts.length

    if (amountVariance / (avgAmount * avgAmount + 0.01) < 0.1) {
      recurring.push(...txns)
    }
  }
  return recurring
}
