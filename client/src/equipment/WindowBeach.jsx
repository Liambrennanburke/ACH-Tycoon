import { Text } from '@react-three/drei'

export default function WindowBeach({ data }) {
  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      {/* Frame */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[2.5, 2, 0.12]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.6} />
      </mesh>
      {/* Sky */}
      <mesh position={[0, 2, 0.07]}>
        <boxGeometry args={[2.3, 1.8, 0.01]} />
        <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.3} />
      </mesh>
      {/* Sand */}
      <mesh position={[0, 1.3, 0.08]}>
        <boxGeometry args={[2.3, 0.6, 0.01]} />
        <meshStandardMaterial color="#f4d03f" emissive="#f4d03f" emissiveIntensity={0.1} />
      </mesh>
      {/* Water line */}
      <mesh position={[0, 1.65, 0.08]}>
        <boxGeometry args={[2.3, 0.12, 0.01]} />
        <meshStandardMaterial color="#1a8cff" emissive="#1a8cff" emissiveIntensity={0.2} />
      </mesh>
      {/* Sun */}
      <mesh position={[0.6, 2.6, 0.08]}>
        <circleGeometry args={[0.2, 16]} />
        <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.8} />
      </mesh>
      {/* Palm trunk */}
      <mesh position={[-0.6, 1.8, 0.09]}>
        <boxGeometry args={[0.06, 0.8, 0.01]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Palm leaves */}
      {[-0.3, -0.15, 0, 0.15].map((dx, i) => (
        <mesh key={i} position={[-0.6 + dx, 2.25 + i * 0.03, 0.09]} rotation-z={(i - 1.5) * 0.3}>
          <boxGeometry args={[0.25, 0.03, 0.01]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
      ))}
      <Text
        position={[0, 0.85, 0.08]}
        fontSize={0.08}
        color="#886644"
        anchorX="center"
      >
        wish you were here
      </Text>
      <pointLight position={[0, 2.5, 0.5]} color="#FFD700" intensity={2} distance={4} />
      <mesh userData={{ interactable: true, equipmentType: 'window_beach', equipmentId: data.id }} position={[0, 2, 0.07]}>
        <boxGeometry args={[2.3, 1.8, 0.02]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}
