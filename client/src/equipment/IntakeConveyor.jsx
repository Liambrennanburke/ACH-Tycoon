import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function IntakeConveyor({ data }) {
  const beltRef = useRef()

  useFrame((_, delta) => {
    if (beltRef.current) {
      beltRef.current.material.map?.offset.set(
        beltRef.current.material.map?.offset.x || 0,
        ((beltRef.current.material.map?.offset.y || 0) + delta * 0.5) % 1
      )
    }
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      {/* Belt surface */}
      <mesh ref={beltRef} position={[0, 0.75, 0]}>
        <boxGeometry args={[3, 0.1, 1]} />
        <meshStandardMaterial color="#333333" roughness={0.6} />
      </mesh>
      {/* Side rails */}
      <mesh position={[0, 0.85, 0.5]}>
        <boxGeometry args={[3, 0.2, 0.05]} />
        <meshStandardMaterial color="#555555" metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.85, -0.5]}>
        <boxGeometry args={[3, 0.2, 0.05]} />
        <meshStandardMaterial color="#555555" metalness={0.5} />
      </mesh>
      {/* Legs */}
      {[[-1.2, 0, -0.4], [-1.2, 0, 0.4], [1.2, 0, -0.4], [1.2, 0, 0.4]].map(([x, _, z], i) => (
        <mesh key={i} position={[x, 0.375, z]}>
          <boxGeometry args={[0.08, 0.75, 0.08]} />
          <meshStandardMaterial color="#444444" metalness={0.4} />
        </mesh>
      ))}
      {/* Output port indicator */}
      <mesh position={[-1.6, 0.85, 0]} userData={{ interactable: true, portType: 'output', equipmentId: data.id }}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}
