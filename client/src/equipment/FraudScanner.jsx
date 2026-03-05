import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export default function FraudScanner({ data }) {
  const laserRef = useRef()

  useFrame(({ clock }) => {
    if (laserRef.current) {
      laserRef.current.position.y = 0.8 + Math.sin(clock.elapsedTime * 2) * 0.5
    }
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      {/* Archway */}
      <mesh position={[-0.7, 1.2, 0]}>
        <boxGeometry args={[0.12, 2.4, 1.4]} />
        <meshStandardMaterial color="#8e44ad" metalness={0.6} />
      </mesh>
      <mesh position={[0.7, 1.2, 0]}>
        <boxGeometry args={[0.12, 2.4, 1.4]} />
        <meshStandardMaterial color="#8e44ad" metalness={0.6} />
      </mesh>
      <mesh position={[0, 2.4, 0]}>
        <boxGeometry args={[1.52, 0.12, 1.4]} />
        <meshStandardMaterial color="#8e44ad" metalness={0.6} />
      </mesh>

      {/* Red scanning laser */}
      <mesh ref={laserRef} position={[0, 1.2, 0]}>
        <boxGeometry args={[1.2, 0.02, 0.02]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
      </mesh>

      <mesh position={[0, 0.75, 0]} userData={{ interactable: true, equipmentType: 'fraud_scanner', equipmentId: data.id }}>
        <boxGeometry args={[1.6, 0.06, 1]} />
        <meshStandardMaterial color="#222" roughness={0.7} />
      </mesh>

      <Text position={[0, 2.65, 0.7]} fontSize={0.1} color="#ff4444" anchorX="center">FRAUD SCANNER</Text>
      <Text position={[0, 2.5, 0.7]} fontSize={0.065} color="#888" anchorX="center">Flags txns over $2,000</Text>

      <pointLight position={[0, 1.5, 0]} color="#ff0000" intensity={1.5} distance={3} />
    </group>
  )
}
