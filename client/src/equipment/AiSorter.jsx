import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import useGameStore from '../store/gameStore'

export default function AiSorter({ data }) {
  const glowRef = useRef()
  const nearby = useGameStore((s) => s.activeEnvelopes.filter((env) => {
    if (!env.position) return false
    const dx = env.position.x - data.position.x, dz = env.position.z - data.position.z
    return Math.sqrt(dx * dx + dz * dz) < 3.5
  }).length)

  useFrame(({ clock }) => {
    if (glowRef.current) glowRef.current.material.emissiveIntensity = 0.3 + Math.sin(clock.elapsedTime * 2) * 0.2
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      <mesh position={[0, 1.2, 0]} userData={{ interactable: true, equipmentType: 'ai_sorter', equipmentId: data.id }}>
        <boxGeometry args={[2.5, 2.4, 1.5]} />
        <meshStandardMaterial color="#1a1a3e" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh ref={glowRef} position={[0, 2.5, 0.76]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 2.8, 0.76]} fontSize={0.12} color="#a855f7" anchorX="center">AI SORTER</Text>
      <Text position={[0, 2.6, 0.76]} fontSize={0.07} color="#888" anchorX="center">95% accuracy | 3s/env | {nearby} queued</Text>
      {nearby > 0 && <pointLight position={[0, 2.8, 0]} color="#a855f7" intensity={3} distance={4} />}
    </group>
  )
}
