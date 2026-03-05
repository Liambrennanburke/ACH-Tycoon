import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export default function HvacUnit({ data }) {
  const fanRef = useRef()
  useFrame(({ clock }) => { if (fanRef.current) fanRef.current.rotation.y = clock.elapsedTime * 8 })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      <mesh position={[0, 7.2, 0]} userData={{ interactable: true, equipmentType: 'hvac_unit', equipmentId: data.id }}>
        <boxGeometry args={[2, 0.6, 1]} />
        <meshStandardMaterial color="#718096" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh ref={fanRef} position={[0, 7.0, 0]}>
        <boxGeometry args={[1.2, 0.03, 0.15]} />
        <meshStandardMaterial color="#a0aec0" />
      </mesh>
      <Text position={[0, 7.6, 0.55]} fontSize={0.08} color="#90cdf4" anchorX="center">HVAC</Text>
      <pointLight position={[0, 6.5, 0]} color="#90cdf4" intensity={1} distance={8} />
    </group>
  )
}
