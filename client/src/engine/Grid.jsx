import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useGameStore from '../store/gameStore'
import { BUILDING } from '../../../shared/types.js'

export default function PlacementGrid() {
  const ghostRef = useRef()
  const placementMode = useGameStore((s) => s.placementMode)
  const { camera } = useThree()

  useFrame(() => {
    if (!placementMode || !ghostRef.current) return

    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const target = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, target)

    if (target) {
      ghostRef.current.position.x = Math.round(target.x)
      ghostRef.current.position.z = Math.round(target.z)
      ghostRef.current.position.y = 0.5
      ghostRef.current.visible = true
    }
  })

  if (!placementMode) return null

  const [w, d] = placementMode.gridSize || [1, 1]

  return (
    <mesh ref={ghostRef} visible={false}>
      <boxGeometry args={[w || 1, 1, d || 1]} />
      <meshStandardMaterial
        color="#00ff88"
        transparent
        opacity={0.35}
        wireframe={false}
      />
    </mesh>
  )
}
