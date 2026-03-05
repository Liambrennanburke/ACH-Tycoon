import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import useGameStore from '../store/gameStore'

const SLOT_NAMES = ['ACH DEBIT', 'ACH CREDIT', 'WIRE', 'RECURRING', 'RETURNS']
const SLOT_COLORS = ['#e74c3c', '#2ecc71', '#3498db', '#f1c40f', '#ff2222']

export default function SortingDesk({ data }) {
  const screenRef = useRef()
  const activeEnvelopes = useGameStore((s) => s.activeEnvelopes)
  const heldEnvelope = useGameStore((s) => s.heldEnvelope)

  const nearby = activeEnvelopes.filter((env) => {
    if (!env.position) return false
    const dx = env.position.x - data.position.x
    const dz = env.position.z - data.position.z
    return Math.sqrt(dx * dx + dz * dz) < 2
  })

  const queueCount = nearby.length
  const nextEnv = nearby[0]

  useFrame(({ clock }) => {
    if (screenRef.current) {
      screenRef.current.material.emissiveIntensity = queueCount > 0
        ? 0.2 + Math.sin(clock.elapsedTime * 2) * 0.1
        : 0.05
    }
  })

  const displayEnv = heldEnvelope || nextEnv

  return (
    <group
      position={[data.position.x, 0, data.position.z]}
      rotation-y={data.rotation || 0}
    >
      {/* Desk surface */}
      <mesh position={[0, 0.9, 0]} userData={{ interactable: true, equipmentType: 'sorting_desk', equipmentId: data.id }}>
        <boxGeometry args={[2.2, 0.08, 1.4]} />
        <meshStandardMaterial color="#5d4037" roughness={0.5} />
      </mesh>

      {/* Incoming tray */}
      <mesh position={[0.7, 1.0, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.6]} />
        <meshStandardMaterial color="#666666" metalness={0.3} />
      </mesh>

      {/* Queue count on tray */}
      <Text position={[0.7, 1.15, 0]} fontSize={0.12} color="#ffaa00" anchorX="center">
        {queueCount > 0 ? `${queueCount}` : ''}
      </Text>

      {/* Monitor screen */}
      <mesh ref={screenRef} position={[-0.4, 1.35, -0.45]} rotation-x={-0.3}>
        <boxGeometry args={[0.9, 0.6, 0.03]} />
        <meshStandardMaterial color="#0a0a1a" emissive="#003300" emissiveIntensity={0.1} />
      </mesh>
      {/* Monitor stand */}
      <mesh position={[-0.4, 1.05, -0.45]}>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#333" metalness={0.5} />
      </mesh>

      {/* Screen content — shows sorting recommendation */}
      {displayEnv && (
        <group position={[-0.4, 1.38, -0.42]} rotation-x={-0.3}>
          {/* Merchant */}
          <Text position={[0, 0.15, 0.02]} fontSize={0.055} color="#ccc" anchorX="center" maxWidth={0.8}>
            {(displayEnv.merchantName || 'Unknown').substring(0, 20)}
          </Text>
          {/* Amount */}
          <Text position={[0, 0.06, 0.02]} fontSize={0.06} color={displayEnv.isCredit ? '#2ecc71' : '#ff6b6b'} anchorX="center">
            {displayEnv.isCredit ? '+' : '-'}${Math.abs(displayEnv.amount).toFixed(2)}
          </Text>
          {/* Sort recommendation — the key info */}
          <Text
            position={[0, -0.05, 0.02]}
            fontSize={0.05}
            color={SLOT_COLORS[displayEnv.correctSlot] || '#888'}
            anchorX="center"
            fontWeight="bold"
          >
            {SLOT_NAMES[displayEnv.correctSlot] || '???'}
          </Text>
          {/* Reason */}
          <Text position={[0, -0.14, 0.02]} fontSize={0.035} color="#666" anchorX="center" maxWidth={0.8}>
            {displayEnv.sortReason || ''}
          </Text>
          {/* Return flag warning */}
          {displayEnv.isReturn && (
            <Text position={[0, -0.22, 0.02]} fontSize={0.04} color="#ff2222" anchorX="center" fontWeight="bold">
              RETURN FLAG: {displayEnv.returnFlag}
            </Text>
          )}
        </group>
      )}

      {/* No envelope — idle screen */}
      {!displayEnv && (
        <Text position={[-0.4, 1.38, -0.4]} rotation-x={-0.3} fontSize={0.05} color="#334433" anchorX="center">
          AWAITING ENVELOPE
        </Text>
      )}

      {/* Label */}
      <Text position={[0, 1.55, -0.45]} fontSize={0.08} color="#ffaa00" anchorX="center">
        SORTING TERMINAL
      </Text>

      {/* Category quick-reference strip along the front */}
      {SLOT_NAMES.map((name, i) => (
        <group key={name} position={[-0.8 + i * 0.4, 0.96, 0.55]}>
          <mesh>
            <boxGeometry args={[0.35, 0.04, 0.15]} />
            <meshStandardMaterial color={SLOT_COLORS[i]} emissive={SLOT_COLORS[i]} emissiveIntensity={0.15} />
          </mesh>
          <Text position={[0, 0.04, 0]} fontSize={0.03} color="#fff" anchorX="center">
            {name}
          </Text>
        </group>
      ))}

      {/* Legs */}
      {[[-1, 0, -0.6], [1, 0, -0.6], [-1, 0, 0.6], [1, 0, 0.6]].map(([x, _, z], i) => (
        <mesh key={i} position={[x, 0.45, z]}>
          <boxGeometry args={[0.06, 0.9, 0.06]} />
          <meshStandardMaterial color="#4a3728" />
        </mesh>
      ))}

      {queueCount > 5 && <pointLight position={[0.7, 1.5, 0]} color="#ff8800" intensity={2} distance={3} />}
    </group>
  )
}
