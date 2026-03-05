import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import useGameStore from '../store/gameStore'

export default function TeleportPad({ data }) {
  const ringRef = useRef()
  const padCount = useGameStore((s) => s.placedEquipment.filter((e) => e.type === 'teleport_pad').length)

  useFrame(({ clock }) => {
    if (ringRef.current) ringRef.current.rotation.y = clock.elapsedTime * 3
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} rotation-y={data.rotation || 0}>
      <mesh position={[0, 0.02, 0]} rotation-x={-Math.PI / 2}
        userData={{ interactable: true, equipmentType: 'teleport_pad', equipmentId: data.id }}>
        <circleGeometry args={[0.8, 32]} />
        <meshStandardMaterial color="#805ad5" emissive="#805ad5" emissiveIntensity={0.3} />
      </mesh>
      <mesh ref={ringRef} position={[0, 0.1, 0]} rotation-x={-Math.PI / 2}>
        <torusGeometry args={[0.7, 0.04, 8, 32]} />
        <meshStandardMaterial color="#d6bcfa" emissive="#d6bcfa" emissiveIntensity={0.8} />
      </mesh>
      <Text position={[0, 0.3, 0]} fontSize={0.1} color="#d6bcfa" anchorX="center" rotation-x={-Math.PI / 4}>
        {padCount >= 2 ? 'PRESS T' : 'NEED 2 PADS'}
      </Text>
      <pointLight position={[0, 0.5, 0]} color="#805ad5" intensity={3} distance={3} />
    </group>
  )
}
