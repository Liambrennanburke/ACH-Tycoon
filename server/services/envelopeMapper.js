const CATEGORY_COLORS = {
  FOOD_AND_DRINK: '#e74c3c',
  INCOME: '#2ecc71',
  RENT_AND_UTILITIES: '#3498db',
  GENERAL_MERCHANDISE: '#f1c40f',
  ENTERTAINMENT: '#9b59b6',
  TRANSPORTATION: '#95a5a6',
  TRANSFER_OUT: '#ecf0f1',
  TRANSFER_IN: '#ecf0f1',
  BANK_FEES: '#1a1a1a',
  LOAN_PAYMENTS: '#3498db',
  GENERAL_SERVICES: '#f39c12',
  PERSONAL_CARE: '#e91e63',
  MEDICAL: '#00bcd4',
  GOVERNMENT_AND_NON_PROFIT: '#607d8b',
  OTHER: '#7f8c8d',
}

export function mapTransactionsToEnvelopes(transactions, timeMap) {
  return transactions.map((t, idx) => {
    const amount = Math.abs(t.amount)
    const catPrimary = t.category?.primary || 'OTHER'

    return {
      transaction_id: t.transaction_id || `txn_${idx}`,
      amount: t.amount,
      absAmount: amount,
      category: t.category,
      merchant_name: t.merchant_name || t.name || 'Unknown',
      date: t.date,
      transaction_type: t.amount < 0 ? 'credit' : 'debit',
      payment_channel: t.payment_channel || 'other',
      pending: t.pending || false,
      isRecurring: t.isRecurring || false,
      returnFlag: t.returnFlag || null,
      color: CATEGORY_COLORS[catPrimary] || CATEGORY_COLORS.OTHER,
      size: getEnvelopeSize(amount),
      gameTime: timeMap[t.date] ?? idx * 0.5,
    }
  })
}

function getEnvelopeSize(amount) {
  if (amount < 10) return 'tiny'
  if (amount < 100) return 'small'
  if (amount < 1000) return 'medium'
  if (amount < 5000) return 'large'
  return 'crate'
}
