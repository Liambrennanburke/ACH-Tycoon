import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import useGameStore from '../store/gameStore'

export default function AutoSorter({ data }) {
  const armRef = useRef()
  const activeEnvelopes = useGameStore((s) => s.activeEnvelopes)

  const nearby = activeEnvelopes.filter((env) => {
    if (!env.position) return false
    const dx = env.position.x - data.position.x
    const dz = env.position.z - data.position.z
    return Math.sqrt(dx * dx + dz * dz) < 3.5
  }).length

  useFrame(({ clock }) => {
    if (armRef.current) {
      armRef.current.rotation.z = nearby > 0
        ? Math.sin(clock.elapsedTime * 6) * 0.4
        : Math.sin(clock.elapsedTime * 0.5) * 0.05
    }
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      {/* Machine housing */}
      <mesh position={[0, 1, 0]} userData={{ interactable: true, equipmentType: 'auto_sorter', equipmentId: data.id }}>
        <boxGeometry args={[2.5, 2, 1.5]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Hopper top */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[1.8, 0.2, 1.2]} />
        <meshStandardMaterial color="#34495e" metalness={0.6} />
      </mesh>

      {/* Sorting arm — swings fast when working */}
      <mesh ref={armRef} position={[0, 1.5, 0]}>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <meshStandardMaterial color="#e67e22" metalness={0.7} />
      </mesh>

      {/* Activity light */}
      <mesh position={[0, 2.3, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          color={nearby > 0 ? '#00ff88' : '#555'}
          emissive={nearby > 0 ? '#00ff88' : '#333'}
          emissiveIntensity={nearby > 0 ? 0.8 : 0.1}
        />
      </mesh>

      <Text position={[0, 2.5, 0.8]} fontSize={0.13} color="#ccc" anchorX="center">
        AUTO-SORTER
      </Text>
      <Text position={[0, 2.3, 0.8]} fontSize={0.08} color="#888" anchorX="center">
        85% accuracy | 2s/env | {nearby} queued
      </Text>

      {/* Output indicator tubes */}
      {['#e74c3c','#2ecc71','#3498db','#f1c40f','#ff2222'].map((c, i) => (
        <mesh key={i} position={[-1.3, 0.5 + i * 0.3, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
          <meshStandardMaterial color={c} metalness={0.3} />
        </mesh>
      ))}

      {nearby > 0 && <pointLight position={[0, 2.5, 0]} color="#00ff88" intensity={2} distance={4} />}
    </group>
  )
}
