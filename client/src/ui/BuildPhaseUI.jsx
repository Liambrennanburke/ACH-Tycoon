import useGameStore from '../store/gameStore'
import { GAME_PHASES } from '../../../shared/types.js'

const QUARTER_INFO = [
  'Months 1-3: The trickle begins.',
  'Months 4-6: Volume increasing.',
  'Months 7-9: Steady flow. Build up.',
  'Months 10-12: Holiday rush incoming.',
  'Months 13-15: Automation time.',
  'Months 16-18: Infrastructure stress.',
  'Months 19-21: Heavy volume.',
  'Months 22-24: Final push.',
]

export default function BuildPhaseUI() {
  const setPhase = useGameStore((s) => s.setPhase)
  const setShowCatalog = useGameStore((s) => s.setShowCatalog)
  const money = useGameStore((s) => s.money)
  const xp = useGameStore((s) => s.xp)
  const score = useGameStore((s) => s.score)
  const currentQuarter = useGameStore((s) => s.currentQuarter)
  const equipCount = useGameStore((s) => s.placedEquipment.length)
  const opCost = equipCount * 15

  const accuracy = (score.correctSorts + score.incorrectSorts) > 0
    ? ((score.correctSorts / (score.correctSorts + score.incorrectSorts)) * 100).toFixed(1)
    : '0.0'

  return (
    <div style={overlay}>
      <div style={panel}>
        <div style={{ color: '#555', fontSize: 11, marginBottom: 6 }}>{'━'.repeat(36)}</div>
        <div style={{ fontSize: 16, color: '#ccc', letterSpacing: 3, marginBottom: 4 }}>
          Q{currentQuarter} COMPLETE
        </div>
        <div style={{ color: '#555', fontSize: 11, marginBottom: 20 }}>{'━'.repeat(36)}</div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 3, marginBottom: 20, justifyContent: 'center' }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{
              width: 28, height: 4,
              background: i < currentQuarter ? '#00ff88' : '#222',
            }} />
          ))}
        </div>

        {/* Stats */}
        <div style={{ fontSize: 12, lineHeight: 2.2, marginBottom: 16 }}>
          {[
            ['Processed', score.totalProcessed],
            ['Settled', `$${score.totalValueSettled.toLocaleString()}`],
            ['Accuracy', `${accuracy}%`],
            ['Balance', `$${money.toLocaleString()}`],
            ['Operating Cost', `-$${opCost}/quarter`],
            ['XP', xp],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>{k}</span>
              <span style={{ color: '#ccc' }}>{v}</span>
            </div>
          ))}
        </div>

        {currentQuarter < 8 && (
          <div style={{ fontSize: 11, color: '#555', marginBottom: 16, padding: '6px 0', borderTop: '1px solid #1a1a1a' }}>
            NEXT: {QUARTER_INFO[currentQuarter] || ''}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => setShowCatalog(true)} style={btn}>CATALOG</button>
          <button onClick={() => setPhase(GAME_PHASES.PLAYING)} style={{ ...btn, borderColor: '#00ff88', color: '#00ff88' }}>
            RESUME
          </button>
        </div>
      </div>
    </div>
  )
}

const overlay = {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0,0,0,0.85)', zIndex: 20,
  fontFamily: "'Courier New', monospace", color: '#ccc',
}
const panel = {
  background: '#080808', border: '1px solid #222',
  padding: '24px 32px', maxWidth: 420, width: '90%', textAlign: 'center',
}
const btn = {
  fontFamily: "'Courier New', monospace", fontSize: 12,
  padding: '8px 20px', background: 'transparent',
  border: '1px solid #444', color: '#888', cursor: 'pointer', letterSpacing: 2,
}
