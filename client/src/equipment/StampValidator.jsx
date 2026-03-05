import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import useGameStore from '../store/gameStore'

export default function StampValidator({ data }) {
  const scanLineRef = useRef()
  const activeEnvelopes = useGameStore((s) => s.activeEnvelopes)

  const nearby = activeEnvelopes.filter((env) => {
    if (!env.position || env.validated) return false
    const dx = env.position.x - data.position.x
    const dz = env.position.z - data.position.z
    return Math.sqrt(dx * dx + dz * dz) < 2
  }).length

  useFrame(({ clock }) => {
    if (scanLineRef.current) {
      scanLineRef.current.position.z = Math.sin(clock.elapsedTime * 4) * 0.3
      scanLineRef.current.material.emissiveIntensity = nearby > 0 ? 3 : 1
    }
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      {/* Archway posts */}
      <mesh position={[-0.6, 1, 0]}>
        <boxGeometry args={[0.15, 2, 1.2]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.6} />
      </mesh>
      <mesh position={[0.6, 1, 0]}>
        <boxGeometry args={[0.15, 2, 1.2]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.6} />
      </mesh>
      {/* Top beam */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[1.35, 0.15, 1.2]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.6} />
      </mesh>

      {/* Scan line */}
      <mesh ref={scanLineRef} position={[0, 1, 0]}>
        <boxGeometry args={[1, 0.02, 0.02]} />
        <meshStandardMaterial color={nearby > 0 ? '#ff4444' : '#00ff00'} emissive={nearby > 0 ? '#ff4444' : '#00ff00'} emissiveIntensity={1} />
      </mesh>

      {/* Belt through archway */}
      <mesh position={[0, 0.75, 0]} userData={{ interactable: true, equipmentType: 'stamp_validator', equipmentId: data.id }}>
        <boxGeometry args={[1.8, 0.06, 0.8]} />
        <meshStandardMaterial color="#333" roughness={0.7} />
      </mesh>

      <Text position={[0, 2.3, 0.65]} fontSize={0.1} color={nearby > 0 ? '#ff8800' : '#00ff00'} anchorX="center">
        {nearby > 0 ? 'SCANNING...' : 'VALIDATOR'}
      </Text>
      <Text position={[0, 2.15, 0.65]} fontSize={0.065} color="#888" anchorX="center">
        Catches 90% of returns
      </Text>

      <pointLight position={[0, 1.5, 0]} color={nearby > 0 ? '#ff4444' : '#00ff00'} intensity={nearby > 0 ? 3 : 1} distance={3} />
    </group>
  )
}
