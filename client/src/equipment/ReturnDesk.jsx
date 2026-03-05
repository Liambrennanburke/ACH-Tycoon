import { Text } from '@react-three/drei'
import useGameStore from '../store/gameStore'

export default function ReturnDesk({ data }) {
  const heldEnvelope = useGameStore((s) => s.heldEnvelope)
  const hasReturn = heldEnvelope?.isReturn

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      {/* Desk */}
      <mesh position={[0, 0.9, 0]} userData={{ interactable: true, equipmentType: 'return_desk', equipmentId: data.id }}>
        <boxGeometry args={[2, 0.08, 1.5]} />
        <meshStandardMaterial color="#3d1c1c" roughness={0.5} />
      </mesh>

      {/* Dual monitors */}
      <mesh position={[-0.4, 1.3, -0.5]}>
        <boxGeometry args={[0.5, 0.35, 0.03]} />
        <meshStandardMaterial color="#111" emissive={hasReturn ? '#ff4444' : '#222222'} emissiveIntensity={hasReturn ? 0.4 : 0.1} />
      </mesh>
      <mesh position={[0.4, 1.3, -0.5]}>
        <boxGeometry args={[0.5, 0.35, 0.03]} />
        <meshStandardMaterial color="#111" emissive={hasReturn ? '#ff4444' : '#222222'} emissiveIntensity={hasReturn ? 0.4 : 0.1} />
      </mesh>

      <Text position={[0, 1.7, -0.5]} fontSize={0.12} color={hasReturn ? '#ff4444' : '#888'} anchorX="center">
        {hasReturn ? 'CLICK TO PROCESS RETURN' : 'RETURN DESK'}
      </Text>

      {hasReturn && (
        <Text position={[0, 1.55, -0.5]} fontSize={0.08} color="#ff8888" anchorX="center">
          {`${heldEnvelope.returnFlag}: ${heldEnvelope.merchantName}`}
        </Text>
      )}

      {/* Inbox tray */}
      <mesh position={[0.7, 1.0, 0.2]}>
        <boxGeometry args={[0.4, 0.15, 0.5]} />
        <meshStandardMaterial color="#666" metalness={0.3} />
      </mesh>

      {/* Filing cabinet */}
      <mesh position={[-0.8, 0.5, 0.4]}>
        <boxGeometry args={[0.5, 1, 0.4]} />
        <meshStandardMaterial color="#555" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* Legs */}
      {[[-0.9, 0, -0.65], [0.9, 0, -0.65], [-0.9, 0, 0.65], [0.9, 0, 0.65]].map(([x, _, z], i) => (
        <mesh key={i} position={[x, 0.45, z]}>
          <boxGeometry args={[0.06, 0.9, 0.06]} />
          <meshStandardMaterial color="#2a1515" />
        </mesh>
      ))}

      <pointLight position={[0, 1.8, 0]} color={hasReturn ? '#ff4444' : '#662222'} intensity={hasReturn ? 4 : 1} distance={hasReturn ? 6 : 3} />
    </group>
  )
}
