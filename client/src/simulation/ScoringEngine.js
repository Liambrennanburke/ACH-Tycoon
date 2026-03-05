/**
 * Revenue model based on real ACH clearing house economics:
 *
 * 1. Per-transaction fee: $0.25-$0.50 flat fee per processed transaction
 *    (NACHA charges ~$0.0025 at the network level; operators charge more)
 *
 * 2. Basis points on volume: 0.05% (5 bps) of transaction amount
 *    (how payment networks earn on large-value transactions)
 *
 * 3. Return processing fee: $5.00 per correctly handled return
 *    (banks charge $5-$25 per ACH return; clearing houses take a cut)
 *
 * 4. Same-day settlement premium: 2x the normal fee for fast settlement
 *    (same-day ACH costs originators $0.052/txn at NACHA; operators charge more)
 *
 * 5. Operating costs: per-equipment maintenance per quarter
 *    (electricity, wear, calibration)
 *
 * 6. Penalties: misroutes cost you, late settlements cost you
 */

const FEES = {
  PER_TRANSACTION: 8.00,
  BASIS_POINTS: 0.01,
  RETURN_FEE: 25.00,
  MISROUTE_PENALTY: -5.00,
  LATE_SETTLEMENT_PENALTY: -15.00,
  BATCH_SEAL_BONUS: 10.00,
  EQUIPMENT_COST_PER_QUARTER: 25,
}

class ScoringEngine {
  getAccuracy(score) {
    const total = score.correctSorts + score.incorrectSorts
    return total > 0 ? (score.correctSorts / total) * 100 : 0
  }

  getOnTimeRate(score) {
    const total = score.onTimeSettlements + score.lateSettlements
    return total > 0 ? (score.onTimeSettlements / total) * 100 : 0
  }

  getGrade(score) {
    const accuracy = this.getAccuracy(score)
    const onTime = this.getOnTimeRate(score)
    const combined = accuracy * 0.6 + onTime * 0.4

    if (combined >= 97) return 'S+'
    if (combined >= 93) return 'S'
    if (combined >= 85) return 'A'
    if (combined >= 75) return 'B'
    if (combined >= 60) return 'C'
    if (combined >= 40) return 'D'
    return 'F'
  }

  calculateTransactionFee(amount, isCorrect, isReturn) {
    const absAmount = Math.abs(amount)

    // Base per-transaction fee
    let fee = FEES.PER_TRANSACTION

    // Basis points on volume (5 bps)
    fee += absAmount * FEES.BASIS_POINTS

    if (!isCorrect) {
      fee += FEES.MISROUTE_PENALTY
    }

    // Correctly handled returns earn an extra return processing fee
    if (isReturn && isCorrect) {
      fee += FEES.RETURN_FEE
    }

    return Math.round(fee * 100) / 100
  }

  calculateBatchSealFee(envelopeCount) {
    return FEES.BATCH_SEAL_BONUS * envelopeCount
  }

  calculateOperatingCosts(equipmentCount) {
    return equipmentCount * FEES.EQUIPMENT_COST_PER_QUARTER
  }

  calculateXP(action) {
    switch (action) {
      case 'correct_sort': return 10
      case 'incorrect_sort': return -5
      case 'on_time_settlement': return 25
      case 'late_settlement': return -15
      case 'envelope_dropped': return -3
      case 'batch_sealed': return 15
      case 'return_processed': return 25
      default: return 0
    }
  }

  getFeeBreakdown(amount, isCorrect, isReturn) {
    const absAmount = Math.abs(amount)
    return {
      perTransaction: FEES.PER_TRANSACTION,
      basisPoints: +(absAmount * FEES.BASIS_POINTS).toFixed(2),
      returnFee: (isReturn && isCorrect) ? FEES.RETURN_FEE : 0,
      penalty: !isCorrect ? FEES.MISROUTE_PENALTY : 0,
    }
  }
}

export const FEE_INFO = FEES
export default new ScoringEngine()
