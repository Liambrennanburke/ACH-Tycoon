import { useRef, useEffect, useCallback } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import useGameStore from '../store/gameStore'
import audioManager from '../audio/AudioManager'
import { BUILDING } from '../../../shared/types.js'

const BASE_MOVE_SPEED = 6
const PLAYER_HEIGHT = 1.7
const COLLISION_MARGIN = 0.4
const BOB_SPEED = 10
const BOB_AMOUNT = 0.03
const FOOTSTEP_INTERVAL = 0.45

const halfW = BUILDING.WIDTH / 2 - COLLISION_MARGIN
const halfD = BUILDING.DEPTH / 2 - COLLISION_MARGIN

export default function Player() {
  const controlsRef = useRef()
  const keys = useRef({})
  const bobTimer = useRef(0)
  const footstepTimer = useRef(0)
  const { camera } = useThree()
  const setPointerLocked = useGameStore((s) => s.setPointerLocked)

  useEffect(() => {
    camera.position.set(0, PLAYER_HEIGHT, 10)
  }, [camera])

  const onKeyDown = useCallback((e) => { keys.current[e.code] = true }, [])
  const onKeyUp = useCallback((e) => { keys.current[e.code] = false }, [])

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp) }
  }, [onKeyDown, onKeyUp])

  useFrame((_, delta) => {
    if (!controlsRef.current?.isLocked) return

    const direction = new THREE.Vector3()
    const forward = new THREE.Vector3()
    const right = new THREE.Vector3()

    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()

    if (keys.current['KeyW']) direction.add(forward)
    if (keys.current['KeyS']) direction.sub(forward)
    if (keys.current['KeyD']) direction.add(right)
    if (keys.current['KeyA']) direction.sub(right)

    const hasCoffee = useGameStore.getState().placedEquipment.some((e) => e.type === 'coffee_machine')
    const moveSpeed = hasCoffee ? BASE_MOVE_SPEED * 1.2 : BASE_MOVE_SPEED

    const isMoving = direction.length() > 0
    if (isMoving) {
      direction.normalize()
      camera.position.addScaledVector(direction, moveSpeed * delta)

      bobTimer.current += delta * BOB_SPEED
      footstepTimer.current += delta

      if (footstepTimer.current >= FOOTSTEP_INTERVAL) {
        footstepTimer.current = 0
        audioManager.playFootstep()
      }
    } else {
      bobTimer.current *= 0.9
      footstepTimer.current = FOOTSTEP_INTERVAL * 0.8
    }

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -halfW, halfW)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -halfD, halfD)
    camera.position.y = PLAYER_HEIGHT + Math.sin(bobTimer.current) * BOB_AMOUNT * (isMoving ? 1 : 0)
  })

  return (
    <PointerLockControls
      ref={controlsRef}
      onLock={() => setPointerLocked(true)}
      onUnlock={() => setPointerLocked(false)}
    />
  )
}
