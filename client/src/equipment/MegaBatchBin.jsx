import { Text } from '@react-three/drei'

export default function MegaBatchBin({ data }) {
  const count = data.envelopeCount || 0
  const capacity = 200
  const fillPct = Math.min(count / capacity, 1)

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      {/* Massive hopper */}
      <mesh position={[0, 1, 0]} userData={{ interactable: true, equipmentType: 'mega_batch_bin', equipmentId: data.id }}>
        <boxGeometry args={[3, 2, 3]} />
        <meshStandardMaterial color="#1a2a1a" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Top rim */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[3.1, 0.1, 3.1]} />
        <meshStandardMaterial color="#2a4a2a" metalness={0.6} />
      </mesh>

      {/* Fill level */}
      {count > 0 && (
        <mesh position={[0, 0.1 + fillPct * 1.5, 0]}>
          <boxGeometry args={[2.8, fillPct * 1.6, 2.8]} />
          <meshStandardMaterial color="#c0a060" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Counter display — large */}
      <mesh position={[0, 1.5, 1.51]}>
        <boxGeometry args={[1.2, 0.5, 0.02]} />
        <meshStandardMaterial color="#001a00" />
      </mesh>
      <Text position={[0, 1.55, 1.53]} fontSize={0.2} color="#00ff88" anchorX="center" anchorY="middle">
        {`${count}/${capacity}`}
      </Text>
      <Text position={[0, 1.35, 1.53]} fontSize={0.08} color="#888" anchorX="center">
        MEGA AUTO-SEAL
      </Text>

      {/* Mechanical sealer arms */}
      <mesh position={[1.3, 2.2, 0]}>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color="#e67e22" metalness={0.7} />
      </mesh>
      <mesh position={[-1.3, 2.2, 0]}>
        <boxGeometry args={[0.2, 0.5, 0.2]} />
        <meshStandardMaterial color="#e67e22" metalness={0.7} />
      </mesh>

      {/* Input port */}
      <mesh position={[0, 2.1, 0]} userData={{ portType: 'input', equipmentId: data.id }}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.5} />
      </mesh>

      {fillPct > 0.8 && <pointLight position={[0, 2.5, 0]} color="#ffaa00" intensity={4} distance={5} />}
    </group>
  )
}
