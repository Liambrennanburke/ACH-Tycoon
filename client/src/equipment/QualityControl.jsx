import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export default function QualityControl({ data }) {
  const scanRef = useRef()
  useFrame(({ clock }) => {
    if (scanRef.current) scanRef.current.position.x = Math.sin(clock.elapsedTime * 3) * 0.5
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      <mesh position={[0, 0.9, 0]} userData={{ interactable: true, equipmentType: 'quality_control', equipmentId: data.id }}>
        <boxGeometry args={[2, 0.1, 2]} />
        <meshStandardMaterial color="#2d3748" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.3, -0.7]}>
        <boxGeometry args={[1, 0.7, 0.05]} />
        <meshStandardMaterial color="#111" emissive="#22c55e" emissiveIntensity={0.15} />
      </mesh>
      <mesh ref={scanRef} position={[0, 1.1, 0]}>
        <boxGeometry args={[0.05, 0.3, 1.4]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1} />
      </mesh>
      <Text position={[0, 1.8, -0.7]} fontSize={0.1} color="#22c55e" anchorX="center">QC STATION</Text>
      <Text position={[0, 1.65, -0.7]} fontSize={0.065} color="#888" anchorX="center">Catches auto-sorter errors</Text>
      {[[-0.9, 0, -0.9], [0.9, 0, -0.9], [-0.9, 0, 0.9], [0.9, 0, 0.9]].map(([x, _, z], i) => (
        <mesh key={i} position={[x, 0.45, z]}><boxGeometry args={[0.06, 0.9, 0.06]} /><meshStandardMaterial color="#444" /></mesh>
      ))}
    </group>
  )
}
