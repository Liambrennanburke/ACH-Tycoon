import { useEffect, useState } from 'react'
import useGameStore from '../store/gameStore'

export default function AchievementToast() {
  const achievements = useGameStore((s) => s.achievements)
  const [visible, setVisible] = useState(null)
  const [lastCount, setLastCount] = useState(0)

  useEffect(() => {
    if (achievements.length > lastCount) {
      const newest = achievements[achievements.length - 1]
      setVisible(newest)
      setLastCount(achievements.length)
      const t = setTimeout(() => setVisible(null), 4000)
      return () => clearTimeout(t)
    }
  }, [achievements.length])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
      fontFamily: "'Courier New', monospace", zIndex: 60, pointerEvents: 'none',
      background: 'rgba(0,0,0,0.9)', border: '1px solid #ffd700',
      borderLeft: '3px solid #ffd700', padding: '10px 24px',
      animation: 'slideDown 0.3s ease-out',
    }}>
      <style>{`@keyframes slideDown { from { opacity:0; transform:translateX(-50%) translateY(-20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
      <div style={{ fontSize: 10, color: '#ffd700', letterSpacing: 2, marginBottom: 2 }}>ACHIEVEMENT</div>
      <div style={{ fontSize: 14, color: '#fff' }}>{visible.title}</div>
      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{visible.desc}</div>
    </div>
  )
}
