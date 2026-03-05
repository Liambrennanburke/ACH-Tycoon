import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

export default function CoffeeMachine({ data }) {
  const steamRef = useRef()

  useFrame(({ clock }) => {
    if (steamRef.current) {
      steamRef.current.position.y = 1.4 + Math.sin(clock.elapsedTime * 2) * 0.05
      steamRef.current.material.opacity = 0.15 + Math.sin(clock.elapsedTime * 3) * 0.1
    }
  })

  return (
    <group position={[data.position.x, 0, data.position.z]} userData={{ interactable: true, equipmentType: 'coffee_machine', equipmentId: data.id }}>
      {/* Machine body */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.5, 1.2, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Water tank */}
      <mesh position={[0, 1.0, -0.1]}>
        <boxGeometry args={[0.35, 0.5, 0.15]} />
        <meshStandardMaterial color="#334455" transparent opacity={0.5} />
      </mesh>
      {/* Drip tray */}
      <mesh position={[0, 0.15, 0.1]}>
        <boxGeometry args={[0.35, 0.05, 0.2]} />
        <meshStandardMaterial color="#333" metalness={0.5} />
      </mesh>
      {/* Coffee cup */}
      <mesh position={[0, 0.25, 0.1]}>
        <cylinderGeometry args={[0.05, 0.04, 0.1, 8]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* Coffee in cup */}
      <mesh position={[0, 0.31, 0.1]}>
        <cylinderGeometry args={[0.045, 0.045, 0.02, 8]} />
        <meshStandardMaterial color="#3d1c02" />
      </mesh>
      {/* Steam */}
      <mesh ref={steamRef} position={[0, 1.4, 0.1]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>
      {/* Button */}
      <mesh position={[0.15, 0.7, 0.21]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={0.5} />
      </mesh>
      <Text position={[0, 1.35, 0.22]} fontSize={0.05} color="#888" anchorX="center">COFFEE</Text>
      <Text position={[0, 1.28, 0.22]} fontSize={0.035} color="#666" anchorX="center">+20% speed</Text>
    </group>
  )
}
