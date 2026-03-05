import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function PottedPlant({ data }) {
  const leafRef = useRef()
  useFrame(({ clock }) => {
    if (leafRef.current) leafRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.05
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} userData={{ interactable: true, equipmentType: 'potted_plant', equipmentId: data.id }}>
      {/* Pot */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.2, 0.15, 0.5, 8]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.05, 8]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 4]} />
        <meshStandardMaterial color="#2d5a27" />
      </mesh>
      {/* Leaves */}
      <group ref={leafRef} position={[0, 1, 0]}>
        {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.15, i * 0.05, Math.sin(angle) * 0.15]} rotation-z={0.4 * (i % 2 ? 1 : -1)}>
            <boxGeometry args={[0.18, 0.02, 0.08]} />
            <meshStandardMaterial color={i % 2 ? '#228B22' : '#32CD32'} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
