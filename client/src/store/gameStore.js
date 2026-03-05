import { create } from 'zustand'
import { GAME_PHASES, EQUIPMENT_CATALOG } from '../../../shared/types.js'

const useGameStore = create((set, get) => ({
  phase: GAME_PHASES.TITLE,
  setPhase: (phase) => set({ phase }),

  money: 1000,
  xp: 0,
  reputation: 50,

  addMoney: (amount) => set((s) => ({ money: s.money + amount })),
  spendMoney: (amount) => {
    const s = get()
    if (s.money >= amount) {
      set({ money: s.money - amount })
      return true
    }
    return false
  },
  addXP: (amount) => set((s) => ({ xp: s.xp + amount })),

  placedEquipment: [],
  addEquipment: (equipment) =>
    set((s) => ({ placedEquipment: [...s.placedEquipment, equipment] })),
  removeEquipment: (id) =>
    set((s) => ({
      placedEquipment: s.placedEquipment.filter((e) => e.id !== id),
    })),

  envelopeQueue: [],
  setEnvelopeQueue: (queue) => set({ envelopeQueue: queue }),

  activeEnvelopes: [],
  spawnEnvelope: (envelope) =>
    set((s) => ({ activeEnvelopes: [...s.activeEnvelopes, envelope] })),
  removeEnvelope: (id) =>
    set((s) => ({
      activeEnvelopes: s.activeEnvelopes.filter((e) => e.id !== id),
    })),

  heldEnvelope: null,
  setHeldEnvelope: (envelope) => set({ heldEnvelope: envelope }),

  score: {
    totalProcessed: 0,
    correctSorts: 0,
    incorrectSorts: 0,
    onTimeSettlements: 0,
    lateSettlements: 0,
    totalValueSettled: 0,
    envelopesDropped: 0,
  },
  updateScore: (updates) =>
    set((s) => ({ score: { ...s.score, ...updates } })),
  incrementScore: (key, amount = 1) =>
    set((s) => ({
      score: { ...s.score, [key]: (s.score[key] || 0) + amount },
    })),

  currentQuarter: 0,
  advanceQuarter: () => set((s) => ({ currentQuarter: s.currentQuarter + 1 })),

  gameClockTime: 0,
  setGameClockTime: (t) => set({ gameClockTime: t }),

  plaidConnected: false,
  setPlaidConnected: (v) => set({ plaidConnected: v }),

  transactionStats: null,
  setTransactionStats: (stats) => set({ transactionStats: stats }),

  isPointerLocked: false,
  setPointerLocked: (v) => set({ isPointerLocked: v }),

  placementMode: null,
  setPlacementMode: (mode) => set({ placementMode: mode }),

  connectionMode: null,
  setConnectionMode: (mode) => set({ connectionMode: mode }),

  showCatalog: false,
  setShowCatalog: (v) => set({ showCatalog: v }),

  hoveredTarget: null,
  setHoveredTarget: (target) => set({ hoveredTarget: target }),

  // Tutorial
  tutorialStep: 0,
  tutorialComplete: false,
  advanceTutorial: () => set((s) => ({ tutorialStep: s.tutorialStep + 1 })),
  completeTutorial: () => set({ tutorialComplete: true }),

  // Crisis events
  activeCrisis: null,
  setActiveCrisis: (crisis) => set({ activeCrisis: crisis }),

  // Game feel
  screenFlash: null,
  setScreenFlash: (flash) => set({ screenFlash: flash }),
  floatingTexts: [],
  addFloatingText: (text) => set((s) => ({ floatingTexts: [...s.floatingTexts.slice(-8), text] })),
  removeFloatingText: (id) => set((s) => ({ floatingTexts: s.floatingTexts.filter((t) => t.id !== id) })),
  comboCount: 0,
  setComboCount: (n) => set({ comboCount: n }),

  // Achievements
  achievements: [],
  addAchievement: (a) => set((s) => ({
    achievements: s.achievements.find((x) => x.id === a.id) ? s.achievements : [...s.achievements, a],
  })),

  // Difficulty
  spawnMultiplier: 1,
  setSpawnMultiplier: (m) => set({ spawnMultiplier: m }),
}))

export default useGameStore
