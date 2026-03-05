import useGameStore from '../store/gameStore'
import { EQUIPMENT_CATALOG, EQUIPMENT_TYPES } from '../../../shared/types.js'

export default function EquipmentCatalog() {
  const money = useGameStore((s) => s.money)
  const spendMoney = useGameStore((s) => s.spendMoney)
  const setShowCatalog = useGameStore((s) => s.setShowCatalog)
  const setPlacementMode = useGameStore((s) => s.setPlacementMode)
  const setConnectionMode = useGameStore((s) => s.setConnectionMode)

  const handleBuy = (typeKey) => {
    const item = EQUIPMENT_CATALOG[typeKey]
    if (typeKey === EQUIPMENT_TYPES.PNEUMATIC_TUBE) {
      if (spendMoney(item.cost)) {
        setConnectionMode({ type: typeKey, step: 'source' })
        setShowCatalog(false)
      }
    } else {
      if (spendMoney(item.cost)) {
        setPlacementMode({ type: typeKey, gridSize: item.gridSize })
        setShowCatalog(false)
      }
    }
  }

  return (
    <div style={overlay} onClick={() => setShowCatalog(false)}>
      <div onClick={(e) => e.stopPropagation()} style={panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'baseline' }}>
          <span style={{ fontSize: 14, color: '#ccc', letterSpacing: 2 }}>EQUIPMENT</span>
          <span style={{ fontSize: 12, color: '#00ff88' }}>${money.toLocaleString()}</span>
        </div>
        <div style={{ borderTop: '1px solid #222', paddingTop: 12 }}>
          {Object.entries(EQUIPMENT_CATALOG).map(([key, item]) => {
            const canAfford = money >= item.cost
            return (
              <div key={key} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid #151515',
              }}>
                <div style={{ flex: 1, marginRight: 16 }}>
                  <div style={{ fontSize: 13, color: canAfford ? '#ccc' : '#555' }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: '#555', marginTop: 2, lineHeight: 1.4 }}>
                    {item.description}
                  </div>
                </div>
                <button
                  onClick={() => handleBuy(key)}
                  disabled={!canAfford}
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 12,
                    padding: '5px 14px',
                    background: canAfford ? 'transparent' : '#0a0a0a',
                    border: `1px solid ${canAfford ? '#00ff88' : '#222'}`,
                    color: canAfford ? '#00ff88' : '#333',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ${item.cost}
                </button>
              </div>
            )
          })}
        </div>
        <div style={{ textAlign: 'center', marginTop: 14, color: '#444', fontSize: 10 }}>
          E or click outside to close
        </div>
      </div>
    </div>
  )
}

const overlay = {
  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.75)', zIndex: 20,
  fontFamily: "'Courier New', monospace", color: '#ccc',
}

const panel = {
  background: '#0a0a0a',
  border: '1px solid #222',
  padding: '20px 24px',
  maxWidth: 540, width: '90%',
  maxHeight: '80vh', overflow: 'auto',
}
