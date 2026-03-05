import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export default function BatchBin({ data }) {
  const leverRef = useRef()

  useFrame(({ clock }) => {
    if (leverRef.current) {
      const wobble = data.envelopeCount > 20 ? Math.sin(clock.elapsedTime * 8) * 0.02 : 0
      leverRef.current.position.x = 0.85 + wobble
    }
  })

  const count = data.envelopeCount || 0

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      {/* Hopper body */}
      <mesh position={[0, 0.6, 0]} userData={{ interactable: true, equipmentType: 'batch_bin', equipmentId: data.id }}>
        <boxGeometry args={[1.5, 1.2, 1.5]} />
        <meshStandardMaterial color="#2c3e50" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Open top rim */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[1.6, 0.08, 1.6]} />
        <meshStandardMaterial color="#34495e" metalness={0.5} />
      </mesh>

      {/* Fill level indicator (envelopes inside bin) */}
      {count > 0 && (
        <mesh position={[0, 0.1 + Math.min(count / 25, 1) * 0.9, 0]}>
          <boxGeometry args={[1.3, Math.min(count / 25, 1) * 1.0, 1.3]} />
          <meshStandardMaterial color="#c0a060" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Counter display */}
      <mesh position={[0, 0.9, 0.76]}>
        <boxGeometry args={[0.5, 0.25, 0.02]} />
        <meshStandardMaterial color="#001a00" />
      </mesh>
      <Text
        position={[0, 0.9, 0.78]}
        fontSize={0.12}
        color="#00ff88"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {`${count}/25`}
      </Text>

      {/* SEAL lever */}
      <group ref={leverRef}>
        <mesh
          position={[0.85, 0.8, 0]}
          userData={{ interactable: true, action: 'seal', equipmentId: data.id }}
        >
          <boxGeometry args={[0.08, 0.5, 0.08]} />
          <meshStandardMaterial color={count > 0 ? '#e74c3c' : '#666666'} />
        </mesh>
        <mesh position={[0.85, 1.1, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={count > 0 ? '#c0392b' : '#555555'} />
        </mesh>
      </group>

      {/* Input port */}
      <mesh position={[0, 1.3, 0]} userData={{ portType: 'input', equipmentId: data.id }}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}
