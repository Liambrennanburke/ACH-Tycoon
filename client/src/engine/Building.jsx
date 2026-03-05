import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BUILDING } from '../../../shared/types.js'

const { WIDTH, DEPTH, HEIGHT, WALL_THICKNESS } = BUILDING

const CONCRETE_COLOR = '#8a8a8a'
const WALL_COLOR = '#6b6b6b'
const DOCK_COLOR = '#4a4a4a'
const VAULT_DOOR_COLOR = '#2c3e50'

function FloorGrid() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[WIDTH, DEPTH]} />
        <meshStandardMaterial color={CONCRETE_COLOR} roughness={0.9} />
      </mesh>
      <gridHelper
        args={[Math.max(WIDTH, DEPTH), Math.max(WIDTH, DEPTH), '#555555', '#444444']}
        position={[0, 0.01, 0]}
      />
    </group>
  )
}

function Wall({ position, size, color = WALL_COLOR, ...props }) {
  return (
    <mesh position={position} castShadow receiveShadow {...props}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  )
}

function FluorescentLight({ position, flicker = false }) {
  const lightRef = useRef()
  const seed = useMemo(() => Math.random() * 100, [])

  useFrame(({ clock }) => {
    if (!lightRef.current) return
    if (flicker) {
      const t = clock.elapsedTime + seed
      const noise = Math.sin(t * 12.3) * Math.sin(t * 7.1) * Math.sin(t * 23.7)
      lightRef.current.intensity = noise > 0.6 ? 2 : 8
    }
  })

  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.2, 0.05, 0.15]} />
        <meshStandardMaterial
          color="#fffff0"
          emissive="#fffff0"
          emissiveIntensity={0.5}
        />
      </mesh>
      <pointLight ref={lightRef} intensity={8} distance={12} decay={2} position={[0, -0.1, 0]} color="#ffe8c0" />
    </group>
  )
}

function LoadingDock() {
  const dockX = WIDTH / 2
  return (
    <group>
      {/* Opening in east wall */}
      <mesh position={[dockX, 1.5, 0]}>
        <boxGeometry args={[WALL_THICKNESS + 0.1, 3, 5]} />
        <meshStandardMaterial color={DOCK_COLOR} roughness={0.7} />
      </mesh>
      {/* Dock ramp */}
      <mesh position={[dockX - 0.5, 0.15, 0]} rotation-z={0.05}>
        <boxGeometry args={[2, 0.3, 4.5]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.95} />
      </mesh>
      {/* Delivery chute frame */}
      <mesh position={[dockX - 0.25, 2.5, 0]}>
        <boxGeometry args={[0.5, 0.5, 3]} />
        <meshStandardMaterial color="#333333" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function VaultAlcove() {
  const vaultX = -WIDTH / 2
  return (
    <group>
      {/* Vault door frame */}
      <mesh position={[vaultX + WALL_THICKNESS / 2, HEIGHT / 4, 0]}>
        <boxGeometry args={[0.3, HEIGHT / 2, 6]} />
        <meshStandardMaterial
          color={VAULT_DOOR_COLOR}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>
      {/* Vault door */}
      <mesh position={[vaultX + 0.35, HEIGHT / 4, 0]}>
        <boxGeometry args={[0.2, HEIGHT / 2 - 0.5, 5]} />
        <meshStandardMaterial
          color="#34495e"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Lock wheel */}
      <mesh position={[vaultX + 0.5, HEIGHT / 4, 0]} rotation-z={Math.PI / 4}>
        <torusGeometry args={[0.4, 0.05, 8, 32]} />
        <meshStandardMaterial color="#7f8c8d" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

function OfficeDeskArea() {
  return (
    <group position={[-WIDTH / 2 + 3, 0, -DEPTH / 2 + 3]}>
      {/* Desk */}
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1.5, 0.05, 0.8]} />
        <meshStandardMaterial color="#5d4037" roughness={0.6} />
      </mesh>
      {/* Desk legs */}
      {[[-0.65, 0, -0.3], [0.65, 0, -0.3], [-0.65, 0, 0.3], [0.65, 0, 0.3]].map(
        ([x, _, z], i) => (
          <mesh key={i} position={[x, 0.375, z]}>
            <boxGeometry args={[0.05, 0.75, 0.05]} />
            <meshStandardMaterial color="#4a3728" />
          </mesh>
        )
      )}
      {/* Monitor */}
      <mesh position={[0, 1.1, -0.2]}>
        <boxGeometry args={[0.6, 0.4, 0.03]} />
        <meshStandardMaterial color="#1a1a2e" emissive="#0a3d0a" emissiveIntensity={0.3} />
      </mesh>
      {/* Phone */}
      <mesh position={[0.5, 0.8, 0.1]}>
        <boxGeometry args={[0.12, 0.04, 0.2]} />
        <meshStandardMaterial color="#2c2c2c" />
      </mesh>
    </group>
  )
}

function Ceiling() {
  return (
    <mesh position={[0, HEIGHT, 0]} rotation-x={Math.PI / 2}>
      <planeGeometry args={[WIDTH, DEPTH]} />
      <meshStandardMaterial color="#5a5a5a" side={THREE.DoubleSide} roughness={0.9} />
    </mesh>
  )
}

export default function Building() {
  const hW = WIDTH / 2
  const hD = DEPTH / 2
  const hH = HEIGHT / 2
  const wt = WALL_THICKNESS

  return (
    <group>
      <FloorGrid />
      <Ceiling />

      {/* North wall */}
      <Wall position={[0, hH, -hD]} size={[WIDTH, HEIGHT, wt]} />
      {/* South wall */}
      <Wall position={[0, hH, hD]} size={[WIDTH, HEIGHT, wt]} />
      {/* East wall — two segments with dock opening */}
      <Wall position={[hW, hH, -hD / 2 - 1.25]} size={[wt, HEIGHT, hD - 2.5]} />
      <Wall position={[hW, hH + 1.5, 0]} size={[wt, HEIGHT - 3, 5]} />
      <Wall position={[hW, hH, hD / 2 + 1.25]} size={[wt, HEIGHT, hD - 2.5]} />
      {/* West wall */}
      <Wall position={[-hW, hH, 0]} size={[wt, HEIGHT, DEPTH]} />

      <LoadingDock />
      <VaultAlcove />
      <OfficeDeskArea />

      {/* Fluorescent lights in a grid — a couple flicker for atmosphere */}
      {Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 4 }, (_, col) => (
          <FluorescentLight
            key={`light-${row}-${col}`}
            position={[
              -hW + 5 + col * ((WIDTH - 10) / 3),
              HEIGHT - 0.3,
              -hD + 5 + row * ((DEPTH - 10) / 2),
            ]}
            flicker={(row === 1 && col === 2) || (row === 2 && col === 0)}
          />
        ))
      )}
    </group>
  )
}
