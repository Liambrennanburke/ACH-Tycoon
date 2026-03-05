import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import useGameStore from '../store/gameStore'

export default function LoadBalancer({ data }) {
  const spinRef = useRef()
  const sorterCount = useGameStore((s) => s.placedEquipment.filter(
    (e) => e.type === 'auto_sorter' || e.type === 'ai_sorter'
  ).length)

  useFrame(({ clock }) => {
    if (spinRef.current) spinRef.current.rotation.y = clock.elapsedTime * 2
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      <mesh position={[0, 1, 0]} userData={{ interactable: true, equipmentType: 'load_balancer', equipmentId: data.id }}>
        <cylinderGeometry args={[0.8, 1, 1.8, 8]} />
        <meshStandardMaterial color="#2c5282" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh ref={spinRef} position={[0, 2, 0]}>
        <boxGeometry args={[1.5, 0.08, 0.15]} />
        <meshStandardMaterial color="#63b3ed" emissive="#63b3ed" emissiveIntensity={0.4} />
      </mesh>
      <Text position={[0, 2.4, 0.5]} fontSize={0.1} color="#63b3ed" anchorX="center">LOAD BALANCER</Text>
      <Text position={[0, 2.25, 0.5]} fontSize={0.07} color="#888" anchorX="center">{sorterCount} sorters connected</Text>
      <pointLight position={[0, 2.2, 0]} color="#63b3ed" intensity={2} distance={4} />
    </group>
  )
}
