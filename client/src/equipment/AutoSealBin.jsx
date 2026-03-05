import { Text } from '@react-three/drei'

export default function AutoSealBin({ data }) {
  const count = data.envelopeCount || 0
  const capacity = 50
  const fillPct = Math.min(count / capacity, 1)

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      {/* Hopper body */}
      <mesh position={[0, 0.75, 0]} userData={{ interactable: true, equipmentType: 'auto_seal_bin', equipmentId: data.id }}>
        <boxGeometry args={[2, 1.5, 2]} />
        <meshStandardMaterial color="#1a3a2a" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Top rim */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[2.1, 0.08, 2.1]} />
        <meshStandardMaterial color="#2a5a3a" metalness={0.5} />
      </mesh>

      {/* Fill level */}
      {count > 0 && (
        <mesh position={[0, 0.1 + fillPct * 1.1, 0]}>
          <boxGeometry args={[1.8, fillPct * 1.2, 1.8]} />
          <meshStandardMaterial color="#c0a060" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Counter */}
      <mesh position={[0, 1.1, 1.01]}>
        <boxGeometry args={[0.8, 0.3, 0.02]} />
        <meshStandardMaterial color="#001a00" />
      </mesh>
      <Text position={[0, 1.15, 1.03]} fontSize={0.12} color="#00ff88" anchorX="center" anchorY="middle">
        {`${count}/${capacity}`}
      </Text>
      <Text position={[0, 0.98, 1.03]} fontSize={0.06} color="#888" anchorX="center">
        AUTO-SEAL
      </Text>

      {/* Sealer arm */}
      <mesh position={[0.9, 1.7, 0]}>
        <boxGeometry args={[0.15, 0.4, 0.15]} />
        <meshStandardMaterial color="#e67e22" metalness={0.6} />
      </mesh>

      {/* Input port */}
      <mesh position={[0, 1.6, 0]} userData={{ portType: 'input', equipmentId: data.id }}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.5} />
      </mesh>

      {fillPct > 0.8 && <pointLight position={[0, 2, 0]} color="#ffaa00" intensity={3} distance={3} />}
    </group>
  )
}
