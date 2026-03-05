import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function ConveyorExtension({ data }) {
  const beltRef = useRef()

  useFrame((_, delta) => {
    if (beltRef.current?.material?.map) {
      beltRef.current.material.map.offset.y =
        (beltRef.current.material.map.offset.y + delta * 0.5) % 1
    }
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      {/* Belt surface */}
      <mesh ref={beltRef} position={[0, 0.75, 0]} userData={{ interactable: true, equipmentType: 'conveyor_extension', equipmentId: data.id }}>
        <boxGeometry args={[4, 0.08, 0.8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>

      {/* Side rails */}
      <mesh position={[0, 0.82, 0.42]}>
        <boxGeometry args={[4, 0.14, 0.04]} />
        <meshStandardMaterial color="#555" metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.82, -0.42]}>
        <boxGeometry args={[4, 0.14, 0.04]} />
        <meshStandardMaterial color="#555" metalness={0.5} />
      </mesh>

      {/* Rollers */}
      {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 0.7, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshStandardMaterial color="#444" metalness={0.6} />
        </mesh>
      ))}

      {/* Legs */}
      {[[-1.8, 0, -0.35], [-1.8, 0, 0.35], [1.8, 0, -0.35], [1.8, 0, 0.35]].map(([x, _, z], i) => (
        <mesh key={i} position={[x, 0.37, z]}>
          <boxGeometry args={[0.06, 0.74, 0.06]} />
          <meshStandardMaterial color="#444" metalness={0.4} />
        </mesh>
      ))}

      {/* Direction arrow on belt */}
      <mesh position={[0, 0.8, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.3, 0.5]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={0.3} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}
