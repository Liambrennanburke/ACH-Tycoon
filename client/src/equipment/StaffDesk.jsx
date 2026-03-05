import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export default function StaffDesk({ data }) {
  const headRef = useRef()
  useFrame(({ clock }) => {
    if (headRef.current) headRef.current.rotation.y = Math.sin(clock.elapsedTime * 1.5) * 0.3
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      <mesh position={[0, 0.9, 0]} userData={{ interactable: true, equipmentType: 'staff_desk', equipmentId: data.id }}>
        <boxGeometry args={[2, 0.08, 1.2]} />
        <meshStandardMaterial color="#5d4037" roughness={0.5} />
      </mesh>
      {/* NPC body */}
      <mesh position={[0, 1.4, 0.3]}>
        <boxGeometry args={[0.4, 0.6, 0.25]} />
        <meshStandardMaterial color="#2196f3" />
      </mesh>
      {/* NPC head */}
      <mesh ref={headRef} position={[0, 1.85, 0.3]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#ffccaa" />
      </mesh>
      {/* NPC arms */}
      <mesh position={[-0.25, 1.15, 0.1]} rotation-z={0.3}>
        <boxGeometry args={[0.08, 0.4, 0.08]} />
        <meshStandardMaterial color="#2196f3" />
      </mesh>
      <mesh position={[0.25, 1.15, 0.1]} rotation-z={-0.3}>
        <boxGeometry args={[0.08, 0.4, 0.08]} />
        <meshStandardMaterial color="#2196f3" />
      </mesh>
      <Text position={[0, 2.2, 0.3]} fontSize={0.09} color="#2196f3" anchorX="center">STAFF NPC</Text>
      <Text position={[0, 2.05, 0.3]} fontSize={0.06} color="#888" anchorX="center">60% accuracy | $50/qtr</Text>
      {[[-0.9, 0, -0.5], [0.9, 0, -0.5], [-0.9, 0, 0.5], [0.9, 0, 0.5]].map(([x, _, z], i) => (
        <mesh key={i} position={[x, 0.45, z]}><boxGeometry args={[0.06, 0.9, 0.06]} /><meshStandardMaterial color="#4a3728" /></mesh>
      ))}
    </group>
  )
}
