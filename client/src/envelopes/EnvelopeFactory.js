import { CATEGORY_COLORS } from '../../../shared/types.js'

let nextId = 1

export function createEnvelope(transactionData, spawnPosition) {
  const { amount, category, merchant_name, date, transaction_type, pending } = transactionData

  const isReturn = !!transactionData.returnFlag

  return {
    id: `env_${nextId++}`,
    transactionId: transactionData.transaction_id,
    amount: Math.abs(amount),
    category: category || { primary: 'OTHER' },
    merchantName: merchant_name || 'Unknown',
    date,
    isCredit: transaction_type === 'credit' || amount < 0,
    isRecurring: transactionData.isRecurring || false,
    isReturn,
    returnFlag: transactionData.returnFlag || null,
    state: pending ? 'pending' : 'active',
    position: { ...spawnPosition },
    targetPosition: null,
    currentStation: null,
    sortSlot: null,
    processedCorrectly: null,
    settled: false,
    color: isReturn ? 0xff2222 : (CATEGORY_COLORS[category?.primary] || CATEGORY_COLORS.OTHER),
    correctSlot: determineCorrectSlot(transactionData),
    sortReason: getSortReason(transactionData),
  }
}

function determineCorrectSlot(txn) {
  if (txn.returnFlag) return 4

  if (txn.isRecurring) return 3

  if (txn.payment_channel === 'wire') return 2

  const isCredit = txn.amount < 0 || txn.transaction_type === 'credit'
  if (isCredit) return 1

  // Everything else is ACH Debit
  return 0
}

function getSortReason(txn) {
  if (txn.returnFlag) return `Return: ${txn.returnFlag}`
  if (txn.isRecurring) return 'Recurring charge detected'
  if (txn.payment_channel === 'wire') return 'Wire transfer channel'
  if (txn.amount < 0 || txn.transaction_type === 'credit') return 'Incoming credit/deposit'
  return 'Standard debit transaction'
}
