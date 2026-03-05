import { Text } from '@react-three/drei'

export default function PremiumLane({ data }) {
  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      <mesh position={[0, 0.75, 0]} userData={{ interactable: true, equipmentType: 'premium_lane', equipmentId: data.id }}>
        <boxGeometry args={[3, 0.08, 1]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.82, 0.5]}>
        <boxGeometry args={[3, 0.14, 0.04]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.82, -0.5]}>
        <boxGeometry args={[3, 0.14, 0.04]} />
        <meshStandardMaterial color="#ffd700" metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.8, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.5, 2.5]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.15} transparent opacity={0.3} />
      </mesh>
      <Text position={[0, 1.1, 0.55]} fontSize={0.09} color="#ffd700" anchorX="center">PREMIUM ($1k+)</Text>
      <Text position={[0, 0.95, 0.55]} fontSize={0.06} color="#aa9900" anchorX="center">2x basis points</Text>
    </group>
  )
}
