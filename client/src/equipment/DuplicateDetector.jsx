import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export default function DuplicateDetector({ data }) {
  const pulseRef = useRef()

  useFrame(({ clock }) => {
    if (pulseRef.current) {
      pulseRef.current.material.emissiveIntensity = 0.3 + Math.sin(clock.elapsedTime * 4) * 0.2
    }
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      {/* Main housing */}
      <mesh position={[0, 0.9, 0]} userData={{ interactable: true, equipmentType: 'duplicate_detector', equipmentId: data.id }}>
        <boxGeometry args={[1.5, 1.2, 1]} />
        <meshStandardMaterial color="#1a3050" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Twin scanner eyes */}
      <mesh ref={pulseRef} position={[-0.3, 1.3, 0.51]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.3, 1.3, 0.51]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={0.5} />
      </mesh>

      {/* Screen */}
      <mesh position={[0, 1.0, 0.51]}>
        <boxGeometry args={[0.8, 0.3, 0.02]} />
        <meshStandardMaterial color="#001122" emissive="#003366" emissiveIntensity={0.3} />
      </mesh>

      <Text position={[0, 1.7, 0.51]} fontSize={0.09} color="#00ccff" anchorX="center">DUPE DETECTOR</Text>
      <Text position={[0, 1.55, 0.51]} fontSize={0.06} color="#888" anchorX="center">Catches duplicate charges</Text>

      <pointLight position={[0, 1.5, 0.5]} color="#00ccff" intensity={1.5} distance={3} />
    </group>
  )
}
