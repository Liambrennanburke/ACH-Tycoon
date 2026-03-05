import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function RubberDuck({ data }) {
  const duckRef = useRef()

  useFrame(({ clock }) => {
    if (duckRef.current) {
      duckRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.8) * 0.3
      duckRef.current.position.y = 0.85 + Math.sin(clock.elapsedTime * 1.5) * 0.02
    }
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} userData={{ interactable: true, equipmentType: 'rubber_duck', equipmentId: data.id }}>
      {/* Pedestal */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.8, 8]} />
        <meshStandardMaterial color="#333" metalness={0.3} />
      </mesh>
      {/* Duck body */}
      <group ref={duckRef} position={[0, 0.85, 0]}>
        <mesh>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.15} roughness={0.3} />
        </mesh>
        {/* Head */}
        <mesh position={[0.08, 0.1, 0]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.15} roughness={0.3} />
        </mesh>
        {/* Beak */}
        <mesh position={[0.15, 0.08, 0]}>
          <boxGeometry args={[0.06, 0.02, 0.03]} />
          <meshStandardMaterial color="#FF8C00" />
        </mesh>
        {/* Eyes */}
        <mesh position={[0.12, 0.14, 0.03]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0.12, 0.14, -0.03]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>
      <pointLight position={[0, 1.2, 0]} color="#FFD700" intensity={0.5} distance={2} />
    </group>
  )
}
