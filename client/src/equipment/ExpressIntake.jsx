import { Text } from '@react-three/drei'

export default function ExpressIntake({ data }) {
  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      <mesh position={[0, 0.75, 0]} userData={{ interactable: true, equipmentType: 'express_intake', equipmentId: data.id }}>
        <boxGeometry args={[4, 0.1, 2]} />
        <meshStandardMaterial color="#333" roughness={0.6} />
      </mesh>
      {[-0.6, 0, 0.6].map((z, i) => (
        <mesh key={i} position={[0, 0.82, z]}>
          <boxGeometry args={[4, 0.12, 0.04]} />
          <meshStandardMaterial color="#e67e22" metalness={0.5} />
        </mesh>
      ))}
      {[[-1.8, 0, -0.9], [-1.8, 0, 0.9], [1.8, 0, -0.9], [1.8, 0, 0.9]].map(([x, _, z], i) => (
        <mesh key={i} position={[x, 0.37, z]}>
          <boxGeometry args={[0.08, 0.74, 0.08]} />
          <meshStandardMaterial color="#555" metalness={0.4} />
        </mesh>
      ))}
      <Text position={[0, 1.1, 1.05]} fontSize={0.1} color="#e67e22" anchorX="center">3-LANE EXPRESS</Text>
      <pointLight position={[0, 1.2, 0]} color="#e67e22" intensity={1.5} distance={3} />
    </group>
  )
}
