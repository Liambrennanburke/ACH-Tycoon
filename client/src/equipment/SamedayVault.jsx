import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import useGameStore from '../store/gameStore'

export default function SamedayVault({ data }) {
  const lightRef = useRef()
  const totalSettled = useGameStore((s) => s.score.totalValueSettled)

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 4) * 0.5 + 0.5
      lightRef.current.material.emissiveIntensity = data.isSettling ? pulse : 0.15
    }
  })

  return (
    <group position={[data.position?.x ?? 0, 0, data.position?.z ?? 0]}>
      <mesh position={[0, 2, 0]} userData={{ interactable: true, equipmentType: 'sameday_vault', equipmentId: data.id }}>
        <boxGeometry args={[0.5, 4, 5]} />
        <meshStandardMaterial color="#c9a900" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.3, 2, 0]}>
        <boxGeometry args={[0.25, 3.5, 4.5]} />
        <meshStandardMaterial color="#b8960a" metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh position={[0.45, 2, 0]} rotation-y={Math.PI / 2}>
        <torusGeometry args={[0.5, 0.06, 8, 32]} />
        <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh ref={lightRef} position={[0.35, 4.5, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.15} />
      </mesh>
      <Text position={[0.5, 4.8, 0]} fontSize={0.12} color="#ffd700" anchorX="center" rotation-y={Math.PI / 2}>SAME-DAY VAULT</Text>
      <Text position={[0.5, 4.6, 0]} fontSize={0.08} color="#aa9900" anchorX="center" rotation-y={Math.PI / 2}>10s cycle | 2x fees</Text>
      {data.isSettling && <pointLight position={[0.5, 4.5, 0]} color="#ffd700" intensity={5} distance={6} />}
    </group>
  )
}
