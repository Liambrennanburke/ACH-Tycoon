import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import useGameStore from '../store/gameStore'
import { BUILDING } from '../../../shared/types.js'

export default function SettlementVault({ data }) {
  const lightRef = useRef()
  const totalSettled = useGameStore((s) => s.score.totalValueSettled)

  useFrame(({ clock }) => {
    if (lightRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.5 + 0.5
      lightRef.current.material.emissiveIntensity = data.isSettling ? pulse * 0.8 : 0.1
      lightRef.current.material.color.set(data.isSettling ? '#00ff88' : '#ff4444')
      lightRef.current.material.emissive.set(data.isSettling ? '#00ff88' : '#ff4444')
    }
  })

  return (
    <group position={[data.position?.x ?? -BUILDING.WIDTH / 2 + 1, 0, data.position?.z ?? 0]}>
      {/* Vault door frame */}
      <mesh position={[0, 2, 0]} userData={{ interactable: true, equipmentType: 'settlement_vault', equipmentId: data.id }}>
        <boxGeometry args={[0.4, 4, 5]} />
        <meshStandardMaterial color="#2c3e50" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Vault door */}
      <mesh position={[0.25, 2, 0]}>
        <boxGeometry args={[0.2, 3.5, 4.5]} />
        <meshStandardMaterial color="#34495e" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Lock wheel */}
      <mesh position={[0.4, 2, 0]} rotation-y={Math.PI / 2}>
        <torusGeometry args={[0.5, 0.06, 8, 32]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Settlement counter display */}
      <mesh position={[0.3, 4.2, 0]}>
        <boxGeometry args={[0.3, 0.5, 2]} />
        <meshStandardMaterial color="#001100" />
      </mesh>
      <Text
        position={[0.42, 4.3, 0]}
        fontSize={0.15}
        color="#00ff88"
        anchorX="center"
        anchorY="middle"
        rotation-y={Math.PI / 2}
      >
        {`$${totalSettled.toLocaleString()}`}
      </Text>
      <Text
        position={[0.42, 4.1, 0]}
        fontSize={0.08}
        color="#00ff8888"
        anchorX="center"
        anchorY="middle"
        rotation-y={Math.PI / 2}
      >
        TOTAL SETTLED
      </Text>

      {/* Status light */}
      <mesh ref={lightRef} position={[0.3, 4.6, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          color="#ff4444"
          emissive="#ff4444"
          emissiveIntensity={0.1}
        />
      </mesh>
      {data.isSettling && (
        <pointLight position={[0.5, 4.6, 0]} color="#00ff88" intensity={3} distance={5} />
      )}

      {/* Input port */}
      <mesh position={[1, 0.3, 0]} userData={{ portType: 'input', equipmentId: data.id }}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}
