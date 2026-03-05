import { Text } from '@react-three/drei'
import useGameStore from '../store/gameStore'

export default function WireTerminal({ data }) {
  const held = useGameStore((s) => s.heldEnvelope)
  const isWire = held?.correctSlot === 2

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      <mesh position={[0, 0.9, 0]} userData={{ interactable: true, equipmentType: 'wire_terminal', equipmentId: data.id }}>
        <boxGeometry args={[2, 0.08, 1.5]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.4, -0.5]}>
        <boxGeometry args={[1.2, 0.8, 0.05]} />
        <meshStandardMaterial color="#0a0a1a" emissive={isWire ? '#3498db' : '#111'} emissiveIntensity={isWire ? 0.5 : 0.1} />
      </mesh>
      <mesh position={[0.7, 0.95, 0.3]}>
        <boxGeometry args={[0.3, 0.05, 0.2]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <Text position={[0, 1.9, -0.5]} fontSize={0.11} color="#3498db" anchorX="center">WIRE TERMINAL</Text>
      <Text position={[0, 1.75, -0.5]} fontSize={0.07} color="#888" anchorX="center">10x bps on wires</Text>
      {[[-0.9, 0, -0.65], [0.9, 0, -0.65], [-0.9, 0, 0.65], [0.9, 0, 0.65]].map(([x, _, z], i) => (
        <mesh key={i} position={[x, 0.45, z]}><boxGeometry args={[0.06, 0.9, 0.06]} /><meshStandardMaterial color="#1a2a3a" /></mesh>
      ))}
      {isWire && <pointLight position={[0, 1.5, 0]} color="#3498db" intensity={4} distance={5} />}
    </group>
  )
}
