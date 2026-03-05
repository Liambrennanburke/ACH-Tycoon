import { useCallback, useEffect } from 'react'
import Scene from './engine/Scene'
import PlacementGrid from './engine/Grid'
import HUD from './ui/HUD'
import PlaidTerminal from './ui/PlaidTerminal'
import EquipmentCatalog from './ui/EquipmentCatalog'
import BuildPhaseUI from './ui/BuildPhaseUI'
import ReportCard from './ui/ReportCard'
import Tutorial from './ui/Tutorial'
import ScreenEffects from './ui/ScreenEffects'
import FloatingTexts from './ui/FloatingTexts'
import AchievementToast from './ui/AchievementToast'
import EquipmentRenderer from './equipment/EquipmentRenderer'
import EnvelopeRenderer from './envelopes/EnvelopeRenderer'
import GameLoop from './simulation/GameLoop'
import useGameStore from './store/gameStore'
import { GAME_PHASES } from '../../shared/types.js'

function exitPointerLock() {
  if (document.pointerLockElement) {
    document.exitPointerLock()
  }
}

export default function App() {
  const phase = useGameStore((s) => s.phase)
  const setPhase = useGameStore((s) => s.setPhase)
  const showCatalog = useGameStore((s) => s.showCatalog)
  const setShowCatalog = useGameStore((s) => s.setShowCatalog)

  // Release pointer lock when any overlay is shown
  useEffect(() => {
    if (showCatalog || phase === GAME_PHASES.BUILD_PHASE || phase === GAME_PHASES.SETUP || phase === GAME_PHASES.ENDED) {
      exitPointerLock()
    }
  }, [showCatalog, phase])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.code === 'KeyE' && phase === GAME_PHASES.PLAYING) {
        const next = !showCatalog
        setShowCatalog(next)
        if (next) exitPointerLock()
      }
    },
    [phase, showCatalog, setShowCatalog]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#000' }}>
      {phase === GAME_PHASES.TITLE && <TitleScreen onStart={() => setPhase(GAME_PHASES.SETUP)} />}

      {phase !== GAME_PHASES.TITLE && (
        <>
          <Scene>
            <PlacementGrid />
            <EquipmentRenderer />
            <EnvelopeRenderer />
            <GameLoop />
          </Scene>
          <HUD />
          <ScreenEffects />
          <FloatingTexts />
          <AchievementToast />
          <Tutorial />
        </>
      )}

      {phase === GAME_PHASES.SETUP && <PlaidTerminal />}
      {showCatalog && <EquipmentCatalog />}
      {phase === GAME_PHASES.BUILD_PHASE && <BuildPhaseUI />}
      {phase === GAME_PHASES.ENDED && <ReportCard />}
    </div>
  )
}

function TitleScreen({ onStart }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #050508 0%, #0a0f1a 40%, #0a1a0f 60%, #050508 100%)',
        fontFamily: "'Courier New', monospace",
        color: '#00ff88',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 30px #00ff8844, 0 0 60px #00ff8822; }
          50% { text-shadow: 0 0 40px #00ff8866, 0 0 80px #00ff8844, 0 0 120px #00ff8822; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Scanline effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: 'rgba(0, 255, 136, 0.03)',
          animation: 'scanline 4s linear infinite',
          pointerEvents: 'none',
        }}
      />

      <div style={{ animation: 'fadeIn 1s ease-out' }}>
        <h1
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            letterSpacing: 12,
            marginBottom: 8,
            animation: 'glow 3s ease-in-out infinite',
          }}
        >
          ACH TYCOON
        </h1>
      </div>

      <p style={{ fontSize: 14, opacity: 0.5, marginBottom: 8, letterSpacing: 6, animation: 'fadeIn 1.5s ease-out' }}>
        FIRST-PERSON CLEARING HOUSE BUILDER
      </p>

      <div style={{ fontSize: 11, opacity: 0.3, marginBottom: 48, letterSpacing: 3, animation: 'fadeIn 2s ease-out' }}>
        YOUR TRANSACTIONS. YOUR CLEARING HOUSE. YOUR CHAOS.
      </div>

      <button
        onClick={onStart}
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: 18,
          padding: '14px 52px',
          background: 'transparent',
          border: '2px solid #00ff88',
          color: '#00ff88',
          cursor: 'pointer',
          letterSpacing: 6,
          transition: 'all 0.3s',
          animation: 'fadeIn 2.5s ease-out',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#00ff8818'
          e.target.style.boxShadow = '0 0 30px #00ff8844, inset 0 0 30px #00ff8811'
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'transparent'
          e.target.style.boxShadow = 'none'
        }}
      >
        INITIALIZE
      </button>

      <div
        style={{
          position: 'absolute',
          bottom: 24,
          fontSize: 10,
          opacity: 0.2,
          letterSpacing: 2,
        }}
      >
        v0.1.0 — SANDBOX MODE
      </div>
    </div>
  )
}
