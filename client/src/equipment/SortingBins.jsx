import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import useGameStore from '../store/gameStore'
import { BUILDING } from '../../../shared/types.js'

const BINS = [
  { label: 'ACH\nDEBIT', color: '#e74c3c', slotIndex: 0 },
  { label: 'ACH\nCREDIT', color: '#2ecc71', slotIndex: 1 },
  { label: 'WIRE', color: '#3498db', slotIndex: 2 },
  { label: 'RECURRING', color: '#f1c40f', slotIndex: 3 },
  { label: 'RETURNS', color: '#ff2222', slotIndex: 4 },
]

const SPACING = 3.2
const BIN_Z_START = -((BINS.length - 1) * SPACING) / 2
const WALL_X = -BUILDING.WIDTH / 2 + 2

export default function SortingBins() {
  const heldEnvelope = useGameStore((s) => s.heldEnvelope)
  const beaconRefs = useRef([])

  useFrame(({ clock }) => {
    beaconRefs.current.forEach((ref, i) => {
      if (!ref) return
      if (heldEnvelope && heldEnvelope.correctSlot === i) {
        ref.visible = true
        ref.material.opacity = 0.15 + Math.sin(clock.elapsedTime * 3) * 0.08
      } else {
        ref.visible = false
      }
    })
  })

  return (
    <group>
      {BINS.map((bin, i) => {
        const z = BIN_Z_START + i * SPACING
        const isHolding = !!heldEnvelope
        const isCorrect = heldEnvelope?.correctSlot === bin.slotIndex

        return (
          <group key={bin.slotIndex} position={[WALL_X, 0, z]}>
            {/* Back panel — large colored wall section */}
            <mesh position={[0, 1.5, 0]}>
              <boxGeometry args={[0.3, 3, 3]} />
              <meshStandardMaterial
                color={bin.color}
                emissive={bin.color}
                emissiveIntensity={isCorrect ? 0.4 : 0.05}
                roughness={0.7}
              />
            </mesh>

            {/* Chute opening — the interactable drop zone */}
            <mesh
              position={[0.4, 1.2, 0]}
              userData={{ interactable: true, slotIndex: bin.slotIndex, portType: 'output' }}
            >
              <boxGeometry args={[0.6, 1.0, 2.2]} />
              <meshStandardMaterial
                color="#111111"
                emissive={bin.color}
                emissiveIntensity={isCorrect ? 0.3 : 0.02}
                roughness={0.9}
              />
            </mesh>

            {/* Rim around opening */}
            {/* Top */}
            <mesh position={[0.4, 1.75, 0]}>
              <boxGeometry args={[0.65, 0.1, 2.4]} />
              <meshStandardMaterial color={bin.color} metalness={0.4} />
            </mesh>
            {/* Bottom */}
            <mesh position={[0.4, 0.65, 0]}>
              <boxGeometry args={[0.65, 0.1, 2.4]} />
              <meshStandardMaterial color={bin.color} metalness={0.4} />
            </mesh>
            {/* Left */}
            <mesh position={[0.4, 1.2, -1.2]}>
              <boxGeometry args={[0.65, 1.1, 0.1]} />
              <meshStandardMaterial color={bin.color} metalness={0.4} />
            </mesh>
            {/* Right */}
            <mesh position={[0.4, 1.2, 1.2]}>
              <boxGeometry args={[0.65, 1.1, 0.1]} />
              <meshStandardMaterial color={bin.color} metalness={0.4} />
            </mesh>

            {/* Big label */}
            <Text
              position={[0.15, 2.8, 0]}
              fontSize={0.35}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              rotation-y={Math.PI / 2}
              maxWidth={2.5}
              textAlign="center"
              fontWeight="bold"
            >
              {bin.label}
            </Text>

            {/* Overhead light — always on, brighter when correct */}
            <pointLight
              position={[1, 3.5, 0]}
              color={bin.color}
              intensity={isCorrect ? 8 : 1.5}
              distance={isCorrect ? 8 : 4}
              decay={2}
            />

            {/* Beacon column of light when holding the correct envelope */}
            <mesh
              ref={(el) => { beaconRefs.current[i] = el }}
              position={[0.5, 4, 0]}
              visible={false}
            >
              <cylinderGeometry args={[0.5, 1.2, 5, 8, 1, true]} />
              <meshStandardMaterial
                color={bin.color}
                transparent
                opacity={0.15}
                emissive={bin.color}
                emissiveIntensity={0.5}
                side={2}
                depthWrite={false}
              />
            </mesh>

            {/* Floor arrow/marker */}
            <mesh position={[1.5, 0.02, 0]} rotation-x={-Math.PI / 2}>
              <circleGeometry args={[0.8, 6]} />
              <meshStandardMaterial
                color={bin.color}
                emissive={bin.color}
                emissiveIntensity={isCorrect ? 0.5 : 0.05}
                transparent
                opacity={isCorrect ? 0.6 : 0.15}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
