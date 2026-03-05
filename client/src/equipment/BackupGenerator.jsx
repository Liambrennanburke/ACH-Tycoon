import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export default function BackupGenerator({ data }) {
  const vibeRef = useRef()
  useFrame(({ clock }) => {
    if (vibeRef.current) vibeRef.current.position.y = 0.7 + Math.sin(clock.elapsedTime * 30) * 0.003
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      <mesh ref={vibeRef} position={[0, 0.7, 0]} userData={{ interactable: true, equipmentType: 'backup_generator', equipmentId: data.id }}>
        <boxGeometry args={[2, 1.4, 1.2]} />
        <meshStandardMaterial color="#4a5568" roughness={0.7} metalness={0.4} />
      </mesh>
      <mesh position={[1.05, 0.9, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.7, 1.5, 0.3]}>
        <boxGeometry args={[0.3, 0.15, 0.15]} />
        <meshStandardMaterial color="#222" emissive="#00ff00" emissiveIntensity={0.3} />
      </mesh>
      <Text position={[0, 1.7, 0.65]} fontSize={0.09} color="#68d391" anchorX="center">GENERATOR</Text>
      <Text position={[0, 1.55, 0.65]} fontSize={0.06} color="#888" anchorX="center">Prevents blackouts</Text>
    </group>
  )
}
