import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function PneumaticTube({ data }) {
  const { source, target, capsules = [] } = data
  const capsuleRefs = useRef([])

  const curve = useMemo(() => {
    if (!source || !target) return null
    const s = new THREE.Vector3(source.x, source.y || 1.5, source.z)
    const t = new THREE.Vector3(target.x, target.y || 1.5, target.z)
    const mid = new THREE.Vector3().lerpVectors(s, t, 0.5)
    mid.y = Math.max(s.y, t.y) + 2
    return new THREE.QuadraticBezierCurve3(s, mid, t)
  }, [source, target])

  const tubeGeo = useMemo(() => {
    if (!curve) return null
    return new THREE.TubeGeometry(curve, 32, 0.12, 8, false)
  }, [curve])

  useFrame((_, delta) => {
    capsuleRefs.current.forEach((ref, i) => {
      if (!ref || !curve || !data.capsules?.[i]) return
      const t = data.capsules[i].progress || 0
      const pos = curve.getPointAt(Math.min(t, 1))
      ref.position.copy(pos)
    })
  })

  if (!curve || !tubeGeo) return null

  return (
    <group>
      {/* Tube */}
      <mesh geometry={tubeGeo}>
        <meshStandardMaterial
          color="#aaddff"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>

      {/* Capsules traveling through the tube */}
      {(data.capsules || []).map((capsule, i) => (
        <mesh
          key={capsule.id || i}
          ref={(el) => { capsuleRefs.current[i] = el }}
        >
          <capsuleGeometry args={[0.08, 0.2, 4, 8]} />
          <meshStandardMaterial
            color={capsule.color || '#ff8800'}
            emissive={capsule.color || '#ff8800'}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}
