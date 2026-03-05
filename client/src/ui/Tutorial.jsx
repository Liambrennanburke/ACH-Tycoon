import { useEffect } from 'react'
import useGameStore from '../store/gameStore'
import { GAME_PHASES, EQUIPMENT_TYPES } from '../../../shared/types.js'

const STEPS = [
  { text: 'Press E to open the Equipment Catalog', trigger: (s) => s.showCatalog },
  { text: 'Buy an Intake Conveyor and place it near the east wall (loading dock)', trigger: (s) => s.placedEquipment.some((e) => e.type === EQUIPMENT_TYPES.INTAKE_CONVEYOR) },
  { text: 'Now buy a Manual Sorting Desk and place it', trigger: (s) => s.placedEquipment.some((e) => e.type === EQUIPMENT_TYPES.SORTING_DESK) },
  { text: 'Envelopes are arriving! Walk to the desk and click one to pick it up', trigger: (s) => s.heldEnvelope !== null },
  { text: 'Walk to the glowing chute on the west wall and click to sort it', trigger: (s) => s.score.totalProcessed > 0 },
  { text: 'Buy a Batch Bin from the catalog (E) to collect sorted envelopes', trigger: (s) => s.placedEquipment.some((e) => e.type === EQUIPMENT_TYPES.BATCH_BIN || e.type === EQUIPMENT_TYPES.AUTO_SEAL_BIN) },
  { text: 'You\'re running an ACH clearing house! Keep sorting to earn fees. Press E for more equipment.', trigger: (s) => s.score.totalProcessed >= 5 },
]

export default function Tutorial() {
  const phase = useGameStore((s) => s.phase)
  const step = useGameStore((s) => s.tutorialStep)
  const complete = useGameStore((s) => s.tutorialComplete)
  const advanceTutorial = useGameStore((s) => s.advanceTutorial)
  const completeTutorial = useGameStore((s) => s.completeTutorial)

  const showCatalog = useGameStore((s) => s.showCatalog)
  const placedEquipment = useGameStore((s) => s.placedEquipment)
  const heldEnvelope = useGameStore((s) => s.heldEnvelope)
  const score = useGameStore((s) => s.score)

  useEffect(() => {
    if (complete || phase !== GAME_PHASES.PLAYING) return
    if (step >= STEPS.length) { completeTutorial(); return }
    const current = STEPS[step]
    const state = useGameStore.getState()
    if (current.trigger(state)) advanceTutorial()
  }, [phase, step, complete, showCatalog, placedEquipment, heldEnvelope, score])

  if (complete || phase !== GAME_PHASES.PLAYING || step >= STEPS.length) return null

  return (
    <div style={{
      position: 'absolute',
      bottom: 140,
      left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: "'Courier New', monospace",
      fontSize: 14,
      color: '#fff',
      background: 'rgba(0,0,0,0.85)',
      border: '1px solid #00ff8844',
      borderLeft: '3px solid #00ff88',
      padding: '10px 20px',
      maxWidth: 500,
      textAlign: 'center',
      zIndex: 15,
      pointerEvents: 'none',
    }}>
      <div style={{ fontSize: 10, color: '#00ff88', marginBottom: 4, letterSpacing: 2 }}>
        STEP {step + 1}/{STEPS.length}
      </div>
      {STEPS[step].text}
    </div>
  )
}
