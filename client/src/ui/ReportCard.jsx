import useGameStore from '../store/gameStore'
import { GAME_PHASES } from '../../../shared/types.js'

function getGrade(accuracy, onTime) {
  const combined = accuracy * 0.6 + onTime * 0.4
  if (combined >= 97) return { grade: 'S+', title: 'Federal Reserve Board Governor' }
  if (combined >= 93) return { grade: 'S', title: 'ACH Network Architect' }
  if (combined >= 85) return { grade: 'A', title: 'Senior Clearing Officer' }
  if (combined >= 75) return { grade: 'B', title: 'Settlement Specialist' }
  if (combined >= 60) return { grade: 'C', title: 'Batch Processor' }
  if (combined >= 40) return { grade: 'D', title: 'Junior Envelope Sorter' }
  return { grade: 'F', title: 'Your clearing house has been seized by regulators.' }
}

export default function ReportCard() {
  const score = useGameStore((s) => s.score)
  const money = useGameStore((s) => s.money)
  const placedEquipment = useGameStore((s) => s.placedEquipment)
  const transactionStats = useGameStore((s) => s.transactionStats)

  const totalSorted = score.correctSorts + score.incorrectSorts
  const accuracy = totalSorted > 0 ? (score.correctSorts / totalSorted) * 100 : 0
  const totalSettled = score.onTimeSettlements + score.lateSettlements
  const onTime = totalSettled > 0 ? (score.onTimeSettlements / totalSettled) * 100 : 0
  const { grade, title } = getGrade(accuracy, onTime)

  const tubes = placedEquipment.filter((e) => e.type === 'pneumatic_tube').length
  const stations = placedEquipment.filter((e) => e.type !== 'pneumatic_tube').length

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.92)',
        zIndex: 30,
        fontFamily: "'Courier New', monospace",
        color: '#00ff88',
      }}
    >
      <div
        style={{
          background: '#0a0a0a',
          border: '2px solid #00ff88',
          borderRadius: 8,
          padding: '32px 40px',
          maxWidth: 560,
          width: '90%',
          whiteSpace: 'pre',
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
{`╔═══════════════════════════════════════════════╗
║        ACH TYCOON — CLEARING REPORT           ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  TRANSACTIONS PROCESSED:  ${String(score.totalProcessed).padEnd(20)}║
║  TOTAL VOLUME CLEARED:    $${score.totalValueSettled.toLocaleString().padEnd(19)}║
║  ACCURACY RATE:           ${accuracy.toFixed(1).padEnd(5)}%${' '.repeat(14)}║
║  ON-TIME SETTLEMENT:      ${onTime.toFixed(1).padEnd(5)}%${' '.repeat(14)}║
║  EQUIPMENT FAILURES:      0${' '.repeat(20)}║
║  FINAL NETWORK:           ${String(stations).padEnd(3)} stations${' '.repeat(10)}║
║                           ${String(tubes).padEnd(3)} pneumatic tubes${' '.repeat(3)}║
║                                               ║
║  GRADE: ${grade.padEnd(38)}║
║  TITLE: ${title.substring(0, 38).padEnd(38)}║
║                                               ║
║  ─── YOUR MONEY, BY THE NUMBERS ───           ║
║                                               ║`}
{transactionStats ? `
║  Busiest Day:     ${(transactionStats.busiestDay || 'N/A').padEnd(28)}║
║  Biggest Txn:     $${(transactionStats.biggestAmount?.toLocaleString() || '0').padEnd(27)}║
║  Smallest Txn:    $${(transactionStats.smallestAmount?.toLocaleString() || '0').padEnd(27)}║
║  Top Merchant:    ${(transactionStats.topMerchant || 'N/A').padEnd(28)}║` : ''}
{`║  Envelopes Dropped:  ${String(score.envelopesDropped).padEnd(26)}║
║                                               ║
╚═══════════════════════════════════════════════╝`}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 14,
              padding: '12px 32px',
              background: 'transparent',
              border: '2px solid #00ff88',
              color: '#00ff88',
              cursor: 'pointer',
              letterSpacing: 3,
            }}
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  )
}
