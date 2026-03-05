import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export default function SurgeBuffer({ data }) {
  const levelRef = useRef()
  const buffered = data.bufferedCount || 0

  useFrame(({ clock }) => {
    if (levelRef.current) {
      levelRef.current.scale.y = 0.1 + (buffered / 30) * 0.9
      levelRef.current.material.emissiveIntensity = 0.2 + Math.sin(clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      <mesh position={[0, 0.9, 0]} userData={{ interactable: true, equipmentType: 'surge_buffer', equipmentId: data.id }}>
        <cylinderGeometry args={[0.8, 0.9, 1.8, 12]} />
        <meshStandardMaterial color="#2d3748" metalness={0.5} roughness={0.4} transparent opacity={0.6} />
      </mesh>
      <mesh ref={levelRef} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.7, 0.8, 1.4, 12]} />
        <meshStandardMaterial color="#4299e1" emissive="#4299e1" emissiveIntensity={0.2} transparent opacity={0.5} />
      </mesh>
      <Text position={[0, 2.1, 0.5]} fontSize={0.09} color="#63b3ed" anchorX="center">SURGE BUFFER</Text>
      <Text position={[0, 1.95, 0.5]} fontSize={0.06} color="#888" anchorX="center">Smooths traffic spikes</Text>
      <pointLight position={[0, 2, 0]} color="#4299e1" intensity={1.5} distance={3} />
    </group>
  )
}
