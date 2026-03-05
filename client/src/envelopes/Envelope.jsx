import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { CATEGORY_COLORS } from '../../../shared/types.js'

function getEnvelopeSize(amount) {
  if (amount < 10) return [0.18, 0.12, 0.015]
  if (amount < 100) return [0.22, 0.15, 0.018]
  if (amount < 1000) return [0.28, 0.19, 0.035]
  if (amount < 5000) return [0.34, 0.22, 0.12]
  return [0.44, 0.28, 0.18]
}

const envelopeShape = new THREE.Shape()
envelopeShape.moveTo(-0.5, -0.35)
envelopeShape.lineTo(0.5, -0.35)
envelopeShape.lineTo(0.5, 0.2)
envelopeShape.lineTo(0, 0.4)
envelopeShape.lineTo(-0.5, 0.2)
envelopeShape.closePath()

const extrudeSettings = { depth: 0.03, bevelEnabled: false }

export default function Envelope({ data }) {
  const meshRef = useRef()
  const glowRef = useRef()
  const { amount, category, id, state, isRecurring, isReturn, merchantName } = data

  const color = useMemo(() => {
    if (isReturn) return new THREE.Color(0xff2222)
    const catKey = category?.primary || 'OTHER'
    return new THREE.Color(CATEGORY_COLORS[catKey] || CATEGORY_COLORS.OTHER)
  }, [category, isReturn])

  const size = useMemo(() => getEnvelopeSize(Math.abs(amount)), [amount])
  const isGhost = state === 'pending'
  const isIncome = category?.primary === 'INCOME'
  const isCredit = data.isCredit
  const scale = size[0] / 0.22

  useFrame(({ clock }) => {
    if (!meshRef.current || !data.position) return
    meshRef.current.position.set(data.position.x, data.position.y, data.position.z)
    meshRef.current.position.y += Math.sin(clock.elapsedTime * 2 + (id?.charCodeAt(4) || 0)) * 0.004

    if (glowRef.current) {
      glowRef.current.position.copy(meshRef.current.position)
      const pulse = Math.sin(clock.elapsedTime * (isReturn ? 5 : 3)) * 0.15 + 0.35
      glowRef.current.material.emissiveIntensity = pulse
    }

    if (isRecurring) meshRef.current.rotation.y = Math.sin(clock.elapsedTime * 1.5) * 0.08
    if (isReturn) {
      meshRef.current.rotation.z = Math.sin(clock.elapsedTime * 8) * 0.04
      meshRef.current.rotation.x = Math.cos(clock.elapsedTime * 6) * 0.025
    }
  })

  const showLabel = true

  return (
    <group>
      <group
        ref={meshRef}
        position={data.position ? [data.position.x, data.position.y, data.position.z] : [0, -10, 0]}
        scale={[scale, scale, 1]}
        userData={{ interactable: true, equipmentType: 'envelope', envelopeId: id, envelopeData: data }}
      >
        {/* Envelope body */}
        <mesh castShadow>
          <extrudeGeometry args={[envelopeShape, extrudeSettings]} />
          <meshStandardMaterial
            color={color}
            transparent={isGhost}
            opacity={isGhost ? 0.4 : 0.92}
            roughness={isReturn ? 0.3 : 0.55}
            emissive={color}
            emissiveIntensity={isReturn ? 0.4 : isIncome ? 0.25 : 0.04}
          />
        </mesh>

        {/* Merchant label */}
        {showLabel && (
          <Text
            position={[0, -0.05, 0.035]}
            fontSize={0.08}
            color="#000000"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.8}
          >
            {(merchantName || '').substring(0, 16)}
          </Text>
        )}

        {/* Amount */}
        <Text
          position={[0, -0.2, 0.035]}
          fontSize={0.065}
          color="#00000088"
          anchorX="center"
        >
          ${Math.abs(amount).toFixed(2)}
        </Text>

        {/* Category seal */}
        <mesh position={[0.32, 0.08, 0.035]}>
          <circleGeometry args={[0.06, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>

        {/* RETURN stamp */}
        {isReturn && (
          <Text
            position={[0, 0.05, 0.04]}
            fontSize={0.1}
            color="#ff0000"
            anchorX="center"
            rotation-z={-0.3}
            fontWeight="bold"
          >
            RETURN
          </Text>
        )}

        {/* CREDIT stamp */}
        {isCredit && !isReturn && (
          <Text
            position={[0.2, 0.12, 0.04]}
            fontSize={0.06}
            color="#00aa00"
            anchorX="center"
            fontWeight="bold"
          >
            CREDIT
          </Text>
        )}

        {/* Recurring border indicator */}
        {isRecurring && (
          <mesh position={[0, 0, 0.032]}>
            <ringGeometry args={[0.42, 0.44, 6]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
          </mesh>
        )}
      </group>

      {/* Glow aura */}
      {(isIncome || isReturn) && (
        <mesh ref={glowRef} position={data.position ? [data.position.x, data.position.y, data.position.z] : [0, -10, 0]}>
          <sphereGeometry args={[scale * 0.5, 8, 8]} />
          <meshStandardMaterial
            color={isReturn ? '#ff2222' : '#2ecc71'}
            transparent opacity={0.1}
            emissive={isReturn ? '#ff2222' : '#2ecc71'}
            emissiveIntensity={0.3}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {isReturn && data.position && (
        <pointLight
          position={[data.position.x, data.position.y + 0.15, data.position.z]}
          color="#ff2222" intensity={1.5} distance={1}
        />
      )}
    </group>
  )
}
