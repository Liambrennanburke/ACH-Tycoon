import useGameStore from '../store/gameStore'
import { GAME_PHASES, TIME_COMPRESSION } from '../../../shared/types.js'

const FONT = "'Courier New', Consolas, monospace"
const SLOT_NAMES = ['ACH Debit', 'ACH Credit', 'Wire', 'Recurring', 'RETURNS']
const SLOT_COLORS = ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f', '#ff2222']

function formatGameTime(seconds) {
  const totalMonths = Math.floor((seconds / TIME_COMPRESSION.TOTAL_GAME_DURATION_SEC) * 24)
  const month = totalMonths % 12
  const year = Math.floor(totalMonths / 12) + 1
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${names[month]} Year ${year}`
}

function StatRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ color: color || '#ccc' }}>{value}</span>
    </div>
  )
}

function KeyHint({ keyLabel, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        border: '1px solid #555',
        padding: '2px 6px',
        fontSize: 10,
        color: '#aaa',
        borderRadius: 2,
        minWidth: 20,
        textAlign: 'center',
        background: '#ffffff08',
      }}>{keyLabel}</span>
      <span style={{ color: '#888', fontSize: 11 }}>{action}</span>
    </div>
  )
}

export default function HUD() {
  const phase = useGameStore((s) => s.phase)
  const money = useGameStore((s) => s.money)
  const xp = useGameStore((s) => s.xp)
  const score = useGameStore((s) => s.score)
  const gameClockTime = useGameStore((s) => s.gameClockTime)
  const isPointerLocked = useGameStore((s) => s.isPointerLocked)
  const heldEnvelope = useGameStore((s) => s.heldEnvelope)
  const placementMode = useGameStore((s) => s.placementMode)
  const connectionMode = useGameStore((s) => s.connectionMode)
  const activeEnvelopes = useGameStore((s) => s.activeEnvelopes)
  const hoveredTarget = useGameStore((s) => s.hoveredTarget)
  const placedEquipment = useGameStore((s) => s.placedEquipment)
  const comboCount = useGameStore((s) => s.comboCount)
  const activeCrisis = useGameStore((s) => s.activeCrisis)

  if (phase === GAME_PHASES.TITLE || phase === GAME_PHASES.ENDED) return null

  const accuracy = (score.correctSorts + score.incorrectSorts) > 0
    ? ((score.correctSorts / (score.correctSorts + score.incorrectSorts)) * 100).toFixed(1)
    : '0.0'

  const dotSize = hoveredTarget ? 10 : 6

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none', fontFamily: FONT, zIndex: 10,
    }}>

      {/* ═══ TOP LEFT: Stats (Data Center style) ═══ */}
      <div style={{ position: 'absolute', top: 16, left: 20, fontSize: 13, lineHeight: 1.9, minWidth: 240 }}>
        <StatRow label="Balance" value={`$${money.toLocaleString()}`} color={money > 0 ? '#00ff88' : '#ff4444'} />
        <StatRow label="XP" value={xp} />
        {phase === GAME_PHASES.PLAYING && (
          <StatRow label="Date" value={formatGameTime(gameClockTime)} color="#6699cc" />
        )}
        <div style={{ borderTop: '1px solid #222', margin: '4px 0', paddingTop: 4 }} />
        <StatRow label="Processed" value={score.totalProcessed} />
        <StatRow label="Accuracy" value={`${accuracy}%`} color={parseFloat(accuracy) > 80 ? '#00ff88' : '#ffaa00'} />
        <StatRow label="Volume" value={`$${score.totalValueSettled.toLocaleString()}`} />
        <StatRow label="In Transit" value={activeEnvelopes.length} />
        <div style={{ borderTop: '1px solid #222', margin: '4px 0', paddingTop: 4 }} />
        <div style={{ fontSize: 10, color: '#555', lineHeight: 1.6 }}>
          <div>$8/txn + 1% on volume</div>
          <div>$25/return + $10/batch seal</div>
          <div>-$25/equip/quarter operating</div>
        </div>
      </div>

      {/* ═══ COMBO COUNTER ═══ */}
      {comboCount >= 3 && (
        <div style={{
          position: 'absolute', top: 16, right: 20, fontSize: 28, fontWeight: 'bold',
          color: comboCount >= 10 ? '#ffd700' : '#00ff88',
          textShadow: `0 0 12px ${comboCount >= 10 ? '#ffd700' : '#00ff88'}66`,
        }}>
          x{comboCount}
        </div>
      )}

      {/* ═══ CRISIS BANNER ═══ */}
      {activeCrisis && (
        <div style={{
          position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)',
          fontSize: 16, fontWeight: 'bold', letterSpacing: 4,
          color: '#fff', padding: '6px 24px',
          background: 'rgba(0,0,0,0.8)', border: '1px solid #ff444488',
          animation: 'pulse 0.5s ease-in-out infinite alternate',
        }}>
          <style>{`@keyframes pulse { from { opacity: 0.7; } to { opacity: 1; } }`}</style>
          {activeCrisis.name}
        </div>
      )}

      {/* ═══ BOTTOM LEFT: Controls (Data Center style) ═══ */}
      <div style={{ position: 'absolute', bottom: 16, left: 20, fontSize: 12, lineHeight: 2.2 }}>
        <KeyHint keyLabel="LMB" action="Interact" />
        <KeyHint keyLabel="X" action="Move Equip" />
        <KeyHint keyLabel="T" action="Teleport" />
        <KeyHint keyLabel="E" action="Catalog" />
        <KeyHint keyLabel="ESC" action="Release" />
      </div>

      {/* ═══ CENTER DOT ═══ */}
      {isPointerLocked && (
        <div style={{ position: 'fixed', top: '50vh', left: '50vw', width: 0, height: 0, zIndex: 100 }}>
          <div style={{
            position: 'absolute',
            width: dotSize, height: dotSize,
            top: -dotSize / 2, left: -dotSize / 2,
            borderRadius: '50%',
            background: hoveredTarget ? '#fff' : 'rgba(255,255,255,0.8)',
            boxShadow: hoveredTarget ? '0 0 6px #fff' : '0 0 2px rgba(0,0,0,0.5)',
            transition: 'all 0.08s',
          }} />
          {hoveredTarget && !heldEnvelope && (
            <div style={{
              position: 'absolute', top: 14, left: 0, transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.85)', padding: '2px 8px', fontSize: 11,
              color: '#ccc', whiteSpace: 'nowrap', border: '1px solid #333',
            }}>
              {hoveredTarget.label}
            </div>
          )}
        </div>
      )}

      {/* ═══ HELD ENVELOPE ═══ */}
      {heldEnvelope && (
        <div style={{
          position: 'absolute', bottom: 70, right: 20,
          width: 210, fontSize: 12, color: '#ccc', lineHeight: 1.6,
          borderLeft: `2px solid ${SLOT_COLORS[heldEnvelope.correctSlot] || '#888'}`,
          paddingLeft: 12,
        }}>
          {heldEnvelope.isReturn && (
            <div style={{ color: '#ff2222', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>
              RETURN: {heldEnvelope.returnFlag}
            </div>
          )}
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
            {heldEnvelope.merchantName}
          </div>
          <div style={{ color: heldEnvelope.isCredit ? '#2ecc71' : '#ff6b6b', fontSize: 16, fontWeight: 'bold' }}>
            {heldEnvelope.isCredit ? '+' : '-'}${Math.abs(heldEnvelope.amount).toFixed(2)}
          </div>
          <div style={{ color: '#666', fontSize: 11 }}>
            {heldEnvelope.isCredit ? 'Credit' : 'Debit'}{heldEnvelope.isRecurring ? ' / Recurring' : ''}
          </div>
          {heldEnvelope.sortReason && (
            <div style={{ color: '#888', fontSize: 10, marginTop: 4, fontStyle: 'italic' }}>
              {heldEnvelope.sortReason}
            </div>
          )}
          <div style={{
            marginTop: 6, paddingTop: 6,
            borderTop: '1px solid #333',
            color: SLOT_COLORS[heldEnvelope.correctSlot],
            fontSize: 12, fontWeight: 'bold',
          }}>
            {SLOT_NAMES[heldEnvelope.correctSlot]}
          </div>
        </div>
      )}

      {/* ═══ PLACEMENT / CONNECTION MODE ═══ */}
      {placementMode && (
        <div style={{
          position: 'absolute', top: 'calc(50% - 50px)', left: '50%', transform: 'translateX(-50%)',
          fontSize: 12, color: '#00ff88', background: 'rgba(0,0,0,0.7)', padding: '6px 16px',
          border: '1px solid #00ff8844',
        }}>
          PLACE: {placementMode.type.replace(/_/g, ' ').toUpperCase()} — Click / ESC
        </div>
      )}
      {connectionMode && (
        <div style={{
          position: 'absolute', top: 'calc(50% - 50px)', left: '50%', transform: 'translateX(-50%)',
          fontSize: 12, color: '#3498db', background: 'rgba(0,0,0,0.7)', padding: '6px 16px',
          border: '1px solid #3498db44',
        }}>
          TUBE: {connectionMode.step === 'source' ? 'Click SOURCE' : 'Click DESTINATION'} — ESC
        </div>
      )}

      {/* ═══ CLICK TO PLAY ═══ */}
      {!isPointerLocked && phase !== GAME_PHASES.TITLE && phase !== GAME_PHASES.BUILD_PHASE && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          fontSize: 14, color: '#888', pointerEvents: 'auto', cursor: 'pointer',
          background: 'rgba(0,0,0,0.8)', padding: '12px 24px', border: '1px solid #333',
        }}>
          Click to look around
        </div>
      )}
    </div>
  )
}
