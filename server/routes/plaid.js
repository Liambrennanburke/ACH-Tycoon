import { Router } from 'express'
import { plaidClient } from '../services/plaidClient.js'
import { fetchAllTransactions, processTransactions } from '../services/transactionPipeline.js'
import { mapTransactionsToEnvelopes } from '../services/envelopeMapper.js'
import { compressTimeline } from '../services/timeCompressor.js'

const router = Router()

let accessToken = null

router.post('/link-token', async (req, res) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'ach-tycoon-player' },
      client_name: 'ACH Tycoon',
      products: ['transactions'],
      country_codes: ['US'],
      language: 'en',
    })
    res.json({ link_token: response.data.link_token })
  } catch (error) {
    console.error('Link token error:', error.response?.data || error)
    res.status(500).json({ error: 'Failed to create link token' })
  }
})

router.post('/exchange', async (req, res) => {
  try {
    const { public_token } = req.body
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    })
    accessToken = response.data.access_token
    res.json({ success: true })
  } catch (error) {
    console.error('Exchange error:', error.response?.data || error)
    res.status(500).json({ error: 'Failed to exchange token' })
  }
})

router.get('/transactions', async (req, res) => {
  try {
    if (!accessToken) {
      return res.status(400).json({ error: 'No bank connected. Connect via Plaid first.' })
    }

    const { transactions, stats } = await fetchAllTransactions(accessToken)
    const timeMap = compressTimeline(transactions)
    const envelopes = mapTransactionsToEnvelopes(transactions, timeMap)

    res.json({ envelopes, stats })
  } catch (error) {
    const errData = error.response?.data
    console.error('Transaction fetch error:', errData || error)
    const msg = errData?.error_code === 'PRODUCT_NOT_READY'
      ? 'Transactions not ready yet. Try again in a few seconds.'
      : 'Transaction fetch failed'
    res.status(500).json({ error: msg })
  }
})

router.get('/demo-transactions', (req, res) => {
  const transactions = generateDemoTransactions()
  const { transactions: processed, stats } = processTransactions(transactions)
  const timeMap = compressTimeline(processed)
  const envelopes = mapTransactionsToEnvelopes(processed, timeMap)
  res.json({ envelopes, stats })
})

function generateDemoTransactions() {
  const merchants = [
    { name: 'Whole Foods', category: 'FOOD_AND_DRINK', range: [15, 120] },
    { name: 'Chipotle', category: 'FOOD_AND_DRINK', range: [8, 18] },
    { name: 'Starbucks', category: 'FOOD_AND_DRINK', range: [4, 8] },
    { name: 'Amazon', category: 'GENERAL_MERCHANDISE', range: [5, 200] },
    { name: 'Target', category: 'GENERAL_MERCHANDISE', range: [10, 80] },
    { name: 'Netflix', category: 'ENTERTAINMENT', range: [15.49, 15.49] },
    { name: 'Spotify', category: 'ENTERTAINMENT', range: [9.99, 9.99] },
    { name: 'Uber', category: 'TRANSPORTATION', range: [8, 45] },
    { name: 'Shell Gas', category: 'TRANSPORTATION', range: [25, 60] },
    { name: 'Electric Company', category: 'RENT_AND_UTILITIES', range: [80, 200] },
    { name: 'Water Utility', category: 'RENT_AND_UTILITIES', range: [30, 60] },
    { name: 'Internet Provider', category: 'RENT_AND_UTILITIES', range: [59.99, 59.99] },
    { name: 'Rent Payment', category: 'RENT_AND_UTILITIES', range: [1800, 1800] },
    { name: 'Employer Direct Deposit', category: 'INCOME', range: [-3200, -3200] },
    { name: 'Venmo', category: 'TRANSFER_OUT', range: [5, 200] },
    { name: 'ATM Withdrawal', category: 'BANK_FEES', range: [20, 200] },
    { name: 'Monthly Service Fee', category: 'BANK_FEES', range: [12, 12] },
    { name: 'Gym Membership', category: 'PERSONAL_CARE', range: [49.99, 49.99] },
    { name: 'CVS Pharmacy', category: 'MEDICAL', range: [5, 50] },
    { name: 'Movie Theater', category: 'ENTERTAINMENT', range: [12, 25] },
  ]

  const transactions = []
  const now = new Date()
  const twoYearsAgo = new Date(now)
  twoYearsAgo.setFullYear(now.getFullYear() - 2)
  const daySpan = Math.floor((now - twoYearsAgo) / (1000 * 60 * 60 * 24))

  for (let day = 0; day < daySpan; day++) {
    const date = new Date(twoYearsAgo)
    date.setDate(date.getDate() + day)
    const dateStr = date.toISOString().split('T')[0]
    const month = date.getMonth()
    const dayOfMonth = date.getDate()

    let txnCount = 1 + Math.floor(Math.random() * 4)

    // Holiday spending spike (November-December)
    if (month === 10 || month === 11) txnCount += Math.floor(Math.random() * 3)
    // Payday (1st and 15th)
    if (dayOfMonth === 1 || dayOfMonth === 15) txnCount += 2

    for (let t = 0; t < txnCount; t++) {
      const merchant = merchants[Math.floor(Math.random() * merchants.length)]

      // Recurring items appear monthly on specific dates
      if (
        ['Netflix', 'Spotify', 'Internet Provider', 'Gym Membership', 'Monthly Service Fee'].includes(merchant.name) &&
        dayOfMonth !== 1 && dayOfMonth !== 15
      ) {
        continue
      }

      const [min, max] = merchant.range
      const amount = min === max ? min : +(min + Math.random() * (max - min)).toFixed(2)

      // ~8% of transactions are flagged as potential returns
      const returnRoll = Math.random()
      let returnFlag = null
      if (returnRoll < 0.03) returnFlag = 'R01'       // Insufficient funds
      else if (returnRoll < 0.045) returnFlag = 'R02'  // Account closed
      else if (returnRoll < 0.055) returnFlag = 'R03'  // No account
      else if (returnRoll < 0.065) returnFlag = 'R05'  // Unauthorized
      else if (returnRoll < 0.08) returnFlag = 'R08'   // Payment stopped

      transactions.push({
        transaction_id: `demo_${day}_${t}_${Math.random().toString(36).substr(2, 8)}`,
        amount,
        date: dateStr,
        merchant_name: merchant.name,
        name: merchant.name,
        personal_finance_category: {
          primary: merchant.category,
          detailed: merchant.category,
        },
        payment_channel: Math.random() > 0.3 ? 'online' : 'in store',
        pending: false,
        returnFlag,
      })
    }

    // Payday deposits
    if (dayOfMonth === 1 || dayOfMonth === 15) {
      transactions.push({
        transaction_id: `demo_pay_${day}_${Math.random().toString(36).substr(2, 8)}`,
        amount: -3200,
        date: dateStr,
        merchant_name: 'Employer Direct Deposit',
        name: 'Employer Direct Deposit',
        personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
        payment_channel: 'other',
        pending: false,
      })
    }

    // Monthly rent on the 1st
    if (dayOfMonth === 1) {
      transactions.push({
        transaction_id: `demo_rent_${day}_${Math.random().toString(36).substr(2, 8)}`,
        amount: 1800,
        date: dateStr,
        merchant_name: 'Rent Payment',
        name: 'Rent Payment',
        personal_finance_category: { primary: 'RENT_AND_UTILITIES', detailed: 'RENT' },
        payment_channel: 'other',
        pending: false,
      })
    }
  }

  return transactions
}

export default router
