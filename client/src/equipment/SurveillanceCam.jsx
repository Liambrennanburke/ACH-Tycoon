import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function SurveillanceCam({ data }) {
  const camRef = useRef()
  useFrame(({ clock }) => {
    if (camRef.current) camRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.8
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[0.1, 1, 0.1]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <group ref={camRef} position={[0, 6.5, 0]}>
        <mesh userData={{ interactable: true, equipmentType: 'surveillance_cam', equipmentId: data.id }}>
          <boxGeometry args={[0.25, 0.15, 0.35]} />
          <meshStandardMaterial color="#2d3748" metalness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.2]}>
          <cylinderGeometry args={[0.05, 0.07, 0.1, 8]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial color="#111" emissive="#ff0000" emissiveIntensity={0.5} />
        </mesh>
      </group>
      <pointLight position={[0, 6.5, 0.3]} color="#ff0000" intensity={0.3} distance={1} />
    </group>
  )
}
