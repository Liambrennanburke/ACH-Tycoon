import { useEffect, useState } from 'react'
import useGameStore from '../store/gameStore'

export default function FloatingTexts() {
  const texts = useGameStore((s) => s.floatingTexts)
  const removeFloatingText = useGameStore((s) => s.removeFloatingText)

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none', zIndex: 55,
      fontFamily: "'Courier New', monospace",
    }}>
      {texts.map((t) => (
        <FloatItem key={t.id} data={t} onDone={() => removeFloatingText(t.id)} />
      ))}
    </div>
  )
}

function FloatItem({ data, onDone }) {
  const [opacity, setOpacity] = useState(1)
  const [y, setY] = useState(0)

  useEffect(() => {
    let frame = 0
    const interval = setInterval(() => {
      frame++
      setY(-frame * 1.5)
      setOpacity(Math.max(0, 1 - frame / 40))
      if (frame > 40) { clearInterval(interval); onDone() }
    }, 25)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      position: 'absolute',
      top: `calc(45% + ${y}px)`,
      left: `calc(50% + ${data.offsetX || 0}px)`,
      transform: 'translate(-50%, -50%)',
      fontSize: data.size || 16,
      fontWeight: 'bold',
      color: data.color || '#00ff88',
      opacity,
      textShadow: `0 0 8px ${data.color || '#00ff88'}66`,
    }}>
      {data.text}
    </div>
  )
}
