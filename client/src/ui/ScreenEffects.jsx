import { useEffect, useState } from 'react'
import useGameStore from '../store/gameStore'

export default function ScreenEffects() {
  const screenFlash = useGameStore((s) => s.screenFlash)
  const activeCrisis = useGameStore((s) => s.activeCrisis)
  const [visible, setVisible] = useState(false)
  const [flashColor, setFlashColor] = useState('transparent')

  useEffect(() => {
    if (!screenFlash) return
    setFlashColor(screenFlash.color)
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      useGameStore.setState({ screenFlash: null })
    }, screenFlash.duration || 300)
    return () => clearTimeout(t)
  }, [screenFlash])

  const crisisColor = activeCrisis?.color || null

  return (
    <>
      {/* Brief flash for sort feedback */}
      {visible && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: flashColor, pointerEvents: 'none', zIndex: 50,
          transition: 'opacity 0.2s', opacity: 0.15,
        }} />
      )}
      {/* Crisis edge tint */}
      {crisisColor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none', zIndex: 49,
          boxShadow: `inset 0 0 120px 40px ${crisisColor}`,
        }} />
      )}
    </>
  )
}
