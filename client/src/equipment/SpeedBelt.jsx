import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export default function SpeedBelt({ data }) {
  const stripeRef = useRef()

  useFrame(({ clock }) => {
    if (stripeRef.current) {
      stripeRef.current.position.x = ((clock.elapsedTime * 4) % 4) - 2
    }
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      {/* Belt surface — chrome finish */}
      <mesh position={[0, 0.75, 0]} userData={{ interactable: true, equipmentType: 'speed_belt', equipmentId: data.id }}>
        <boxGeometry args={[4, 0.08, 0.8]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Speed stripes */}
      <mesh ref={stripeRef} position={[0, 0.8, 0]}>
        <boxGeometry args={[0.3, 0.01, 0.6]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.5} />
      </mesh>

      {/* Chrome side rails */}
      <mesh position={[0, 0.82, 0.42]}>
        <boxGeometry args={[4, 0.14, 0.04]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.82, -0.42]}>
        <boxGeometry args={[4, 0.14, 0.04]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Legs */}
      {[[-1.8, 0, -0.35], [-1.8, 0, 0.35], [1.8, 0, -0.35], [1.8, 0, 0.35]].map(([x, _, z], i) => (
        <mesh key={i} position={[x, 0.37, z]}>
          <boxGeometry args={[0.06, 0.74, 0.06]} />
          <meshStandardMaterial color="#666" metalness={0.6} />
        </mesh>
      ))}

      <Text position={[0, 1.0, 0.45]} fontSize={0.08} color="#ffaa00" anchorX="center">3x SPEED</Text>
      <pointLight position={[0, 1, 0]} color="#ffaa00" intensity={1} distance={2} />
    </group>
  )
}
