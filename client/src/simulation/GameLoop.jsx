import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import useGameStore from '../store/gameStore'
import gameClock from './GameClock'
import transactionQueue from './TransactionQueue'
import scoringEngine from './ScoringEngine'
import envelopePool from '../envelopes/EnvelopePool'
import { getInteractionTarget } from '../engine/InteractionSystem'
import audioManager from '../audio/AudioManager'
import { GAME_PHASES, EQUIPMENT_TYPES, EQUIPMENT_CATALOG, BUILDING } from '../../../shared/types.js'

const ENVELOPE_SPEED = 2.5
const ARRIVAL_THRESHOLD = 0.4

function dist2d(a, b) {
  const dx = a.x - b.x
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dz * dz)
}

function moveToward(pos, target, speed, delta) {
  const dx = target.x - pos.x
  const dz = target.z - pos.z
  const d = Math.sqrt(dx * dx + dz * dz)
  if (d < ARRIVAL_THRESHOLD) return { ...target, y: pos.y }
  return {
    x: pos.x + (dx / d) * speed * delta,
    y: pos.y,
    z: pos.z + (dz / d) * speed * delta,
  }
}

export default function GameLoop() {
  const { camera, scene } = useThree()

  const lastQuarterRef = useRef(-1)
  const queueLoadedRef = useRef(false)
  const settlementTimerRef = useRef(0)
  const batchContentsRef = useRef({})
  const tubeTransitsRef = useRef([])

  // Equipment-specific timers
  const autoSorterTimers = useRef({})
  const validatorTimers = useRef({})
  const fraudScannerTimers = useRef({})
  const dupeDetectorTimers = useRef({})
  const lastDupeRef = useRef(null)
  const aiSorterTimers = useRef({})
  const qcTimers = useRef({})
  const staffTimers = useRef({})
  const surgeBufferRef = useRef([])
  const surgeReleaseTimer = useRef(0)
  const powerOutageRef = useRef({ active: false, timer: 0, nextEvent: 60 + Math.random() * 120 })
  const crisisTimerRef = useRef(0)
  const lastCrisisRef = useRef(0)
  const comboRef = useRef(0)
  const ambientStartedRef = useRef(false)
  const achievementCheckerRef = useRef(0)

  const envelopeQueue = useGameStore((s) => s.envelopeQueue)
  const phase = useGameStore((s) => s.phase)

  const storeRef = useRef(useGameStore.getState())
  useEffect(() => useGameStore.subscribe((s) => { storeRef.current = s }), [])

  useEffect(() => {
    if (envelopeQueue.length > 0 && !queueLoadedRef.current) {
      transactionQueue.load(envelopeQueue)
      queueLoadedRef.current = true
    }
  }, [envelopeQueue])

  useEffect(() => {
    if (phase === GAME_PHASES.PLAYING) gameClock.start()
    else gameClock.pause()
  }, [phase])

  // ══════════════════════════════════════════════
  // INPUT HANDLERS
  // ══════════════════════════════════════════════
  useEffect(() => {
    const onClick = () => {
      const s = storeRef.current
      if (s.phase !== GAME_PHASES.PLAYING || !s.isPointerLocked) return

      if (s.placementMode) {
        const isWallItem = s.placementMode.type === EQUIPMENT_TYPES.WINDOW_BEACH
          || s.placementMode.type === EQUIPMENT_TYPES.WINDOW_FOREST

        if (isWallItem) {
          const wallPos = snapToWall(camera)
          if (wallPos) {
            s.addEquipment({
              id: `eq_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              type: s.placementMode.type,
              position: wallPos.position,
              rotation: wallPos.rotation,
              health: 100, capsules: [],
              envelopeCount: 0, sealed: false, isSettling: false,
            })
            s.setPlacementMode(null)
          }
        } else {
          const pos = raycastFloor(camera)
          if (pos) {
            s.addEquipment({
              id: `eq_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              type: s.placementMode.type,
              position: { x: pos.x, y: 0, z: pos.z },
              rotation: 0, health: 100, capsules: [],
              envelopeCount: 0, sealed: false, isSettling: false,
            })
            s.setPlacementMode(null)
          }
        }
        return
      }

      if (s.connectionMode) {
        const pos = raycastFloor(camera)
        if (!pos) return
        if (s.connectionMode.step === 'source') {
          s.setConnectionMode({ ...s.connectionMode, source: { x: pos.x, y: 1.5, z: pos.z }, step: 'target' })
        } else {
          s.addEquipment({
            id: `tube_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            type: EQUIPMENT_TYPES.PNEUMATIC_TUBE,
            source: s.connectionMode.source,
            target: { x: pos.x, y: 1.5, z: pos.z },
            capsules: [],
          })
          s.setConnectionMode(null)
        }
        return
      }

      handleInteract()
    }

    const onKeyDown = (e) => {
      const s = storeRef.current
      if (s.phase !== GAME_PHASES.PLAYING) return
      if (e.code === 'KeyF') handleInteract()
      if (e.code === 'KeyX') handlePickupEquipment()
      if (e.code === 'KeyT') handleTeleport()
      if (e.code === 'Escape') {
        if (s.placementMode) s.setPlacementMode(null)
        if (s.connectionMode) s.setConnectionMode(null)
      }
    }

    window.addEventListener('click', onClick)
    window.addEventListener('keydown', onKeyDown)
    return () => { window.removeEventListener('click', onClick); window.removeEventListener('keydown', onKeyDown) }
  }, [camera, scene])

  function raycastFloor(cam) {
    const rc = new THREE.Raycaster()
    rc.setFromCamera(new THREE.Vector2(0, 0), cam)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const target = new THREE.Vector3()
    rc.ray.intersectPlane(plane, target)
    if (target) { target.x = Math.round(target.x); target.z = Math.round(target.z); return target }
    return null
  }

  function hasCamera() {
    return storeRef.current.placedEquipment.some((e) => e.type === EQUIPMENT_TYPES.SURVEILLANCE_CAM)
  }

  function handlePickupEquipment() {
    const s = storeRef.current
    if (s.heldEnvelope) return

    const interactables = []
    scene.traverse((child) => { if (child.userData?.interactable && child.userData?.equipmentId) interactables.push(child) })

    const hit = getInteractionTarget(camera, interactables, hasCamera())
    if (!hit) return
    const ud = hit.object.userData
    if (!ud.equipmentId || ud.equipmentType === 'envelope') return

    const eq = s.placedEquipment.find((e) => e.id === ud.equipmentId)
    if (!eq) return

    // Refund half the cost and enter placement mode for that type
    const catalogEntry = EQUIPMENT_CATALOG[eq.type]
    if (catalogEntry) {
      const refund = Math.floor(catalogEntry.cost * 0.5)
      s.addMoney(refund)
    }
    s.removeEquipment(eq.id)
    s.setPlacementMode({ type: eq.type, gridSize: catalogEntry?.gridSize || [1, 1] })
    audioManager.playStamp()
  }

  function snapToWall(cam) {
    const hW = BUILDING.WIDTH / 2 - BUILDING.WALL_THICKNESS / 2
    const hD = BUILDING.DEPTH / 2 - BUILDING.WALL_THICKNESS / 2
    const px = cam.position.x
    const pz = cam.position.z

    // Each wall: position flush against it, rotation facing into room
    const walls = [
      { x: -hW, z: Math.round(pz), rotation: Math.PI / 2, dist: Math.abs(px + hW) },  // west
      { x: hW,  z: Math.round(pz), rotation: -Math.PI / 2, dist: Math.abs(px - hW) },  // east
      { x: Math.round(px), z: -hD, rotation: 0, dist: Math.abs(pz + hD) },              // north
      { x: Math.round(px), z: hD,  rotation: Math.PI, dist: Math.abs(pz - hD) },        // south
    ]

    const nearest = walls.sort((a, b) => a.dist - b.dist)[0]
    if (nearest.dist > 15) return null

    return {
      position: { x: nearest.x, y: 0, z: nearest.z },
      rotation: nearest.rotation,
    }
  }

  function handleTeleport() {
    const s = storeRef.current
    const pads = s.placedEquipment.filter((e) => e.type === EQUIPMENT_TYPES.TELEPORT_PAD)
    if (pads.length < 2) return

    const playerPos = camera.position
    let closest = null
    let closestDist = 4
    pads.forEach((p) => {
      const dx = p.position.x - playerPos.x
      const dz = p.position.z - playerPos.z
      const d = Math.sqrt(dx * dx + dz * dz)
      if (d < closestDist) { closestDist = d; closest = p }
    })
    if (!closest) return

    const other = pads.find((p) => p.id !== closest.id)
    if (other) {
      camera.position.x = other.position.x
      camera.position.z = other.position.z
      audioManager.playTubeWhoosh()
    }
  }

  function scoreEnvelope(envelope, slotIndex) {
    const s = useGameStore.getState()
    const correct = envelope.correctSlot === slotIndex
    const isReturn = envelope.isReturn && slotIndex === 4
    s.incrementScore(correct ? 'correctSorts' : 'incorrectSorts')
    s.incrementScore('totalProcessed')
    const fee = scoringEngine.calculateTransactionFee(envelope.amount, correct, isReturn)
    s.addMoney(fee)
    s.incrementScore('totalValueSettled', envelope.amount)

    if (correct) {
      comboRef.current++
      const combo = comboRef.current
      const xpMult = Math.min(combo, 10)
      s.addXP(scoringEngine.calculateXP('correct_sort') * xpMult)
      s.setComboCount(combo)
      audioManager.playCorrectSort()
      s.setScreenFlash({ color: '#00ff88', duration: 200 })
      const comboText = combo >= 3 ? ` x${combo}` : ''
      s.addFloatingText({
        id: `ft_${Date.now()}`,
        text: `+$${fee.toFixed(2)}${comboText}`,
        color: '#00ff88',
        offsetX: (Math.random() - 0.5) * 60,
      })
    } else {
      comboRef.current = 0
      s.setComboCount(0)
      s.addXP(scoringEngine.calculateXP('incorrect_sort'))
      audioManager.playIncorrectSort()
      s.setScreenFlash({ color: '#ff2222', duration: 300 })
      s.addFloatingText({
        id: `ft_${Date.now()}`,
        text: `-$${Math.abs(fee).toFixed(2)} MISROUTE`,
        color: '#ff4444',
        offsetX: (Math.random() - 0.5) * 60,
      })
    }
    addToBatchBin(envelope)
  }

  function addToBatchBin(envelope) {
    const s = useGameStore.getState()
    const bins = s.placedEquipment.filter(
      (e) => e.type === EQUIPMENT_TYPES.BATCH_BIN || e.type === EQUIPMENT_TYPES.AUTO_SEAL_BIN || e.type === EQUIPMENT_TYPES.MEGA_BATCH_BIN
    )
    if (bins.length === 0) return

    const bin = bins[0]
    if (!batchContentsRef.current[bin.id]) batchContentsRef.current[bin.id] = []
    batchContentsRef.current[bin.id].push(envelope)

    const count = batchContentsRef.current[bin.id].length
    const updated = s.placedEquipment.map((eq) =>
      eq.id === bin.id ? { ...eq, envelopeCount: count } : eq
    )
    useGameStore.setState({ placedEquipment: updated })

    const capacity = bin.type === EQUIPMENT_TYPES.MEGA_BATCH_BIN ? 200
      : bin.type === EQUIPMENT_TYPES.AUTO_SEAL_BIN ? 50 : 999
    if (count >= capacity) {
      sealBin(bin.id)
    }
  }

  function sealBin(binId) {
    const s = useGameStore.getState()
    const contents = batchContentsRef.current[binId] || []
    if (contents.length === 0) return

    s.incrementScore('onTimeSettlements')
    s.addXP(scoringEngine.calculateXP('batch_sealed'))
    audioManager.playSeal()

    const value = contents.reduce((sum, e) => sum + Math.abs(e.amount || 0), 0)
    s.incrementScore('totalValueSettled', value)

    // Batch settlement bonus: $3 per envelope in the batch
    const batchFee = scoringEngine.calculateBatchSealFee(contents.length)
    s.addMoney(batchFee)

    batchContentsRef.current[binId] = []

    const updated = s.placedEquipment.map((eq) =>
      eq.id === binId ? { ...eq, envelopeCount: 0 } : eq
    )
    useGameStore.setState({ placedEquipment: updated })
  }

  // ══════════════════════════════════════════════
  // HANDLE INTERACT (click/F)
  // ══════════════════════════════════════════════
  function handleInteract() {
    const s = storeRef.current
    const interactables = []
    scene.traverse((child) => { if (child.userData?.interactable) interactables.push(child) })

    const hit = getInteractionTarget(camera, interactables, hasCamera())
    const ud = hit ? hit.object.userData : null

    // Swap envelope: drop held, pick up clicked
    if (s.heldEnvelope && ud?.equipmentType === 'envelope') {
      s.spawnEnvelope({ ...s.heldEnvelope, position: { x: camera.position.x + (Math.random() - 0.5) * 0.3, y: 0.1, z: camera.position.z + (Math.random() - 0.5) * 0.3 } })
      s.incrementScore('envelopesDropped')
      const envData = s.activeEnvelopes.find((e) => e.id === ud.envelopeId)
      if (envData) { s.setHeldEnvelope(envData); s.removeEnvelope(ud.envelopeId); audioManager.playEnvelopePickup() }
      else s.setHeldEnvelope(null)
      return
    }

    // Drop held envelope on floor
    if (s.heldEnvelope && (!ud || (ud.slotIndex === undefined && ud.equipmentType !== 'return_desk' && ud.equipmentType !== 'wire_terminal'))) {
      s.spawnEnvelope({ ...s.heldEnvelope, position: { x: camera.position.x + (Math.random() - 0.5) * 0.3, y: 0.1, z: camera.position.z + (Math.random() - 0.5) * 0.3 } })
      s.setHeldEnvelope(null)
      s.incrementScore('envelopesDropped')
      audioManager.playStamp()
      return
    }

    if (!hit) return

    // Pick up envelope
    if (ud.equipmentType === 'envelope' && !s.heldEnvelope) {
      const envData = s.activeEnvelopes.find((e) => e.id === ud.envelopeId)
      if (envData) { s.setHeldEnvelope(envData); s.removeEnvelope(ud.envelopeId); audioManager.playEnvelopePickup() }
      return
    }

    // Drop into sorting bin
    if (ud.slotIndex !== undefined && s.heldEnvelope) {
      scoreEnvelope(s.heldEnvelope, ud.slotIndex)
      envelopePool.release(s.heldEnvelope.id)
      s.setHeldEnvelope(null)
      return
    }

    // Return desk: process held return envelope
    if (ud.equipmentType === 'return_desk' && s.heldEnvelope) {
      if (s.heldEnvelope.isReturn) {
        s.incrementScore('correctSorts')
        s.incrementScore('totalProcessed')
        const fee = scoringEngine.calculateTransactionFee(s.heldEnvelope.amount, true, true)
        s.addMoney(fee)
        s.addXP(scoringEngine.calculateXP('return_processed'))
        audioManager.playCorrectSort()
        addToBatchBin(s.heldEnvelope)
      } else {
        s.incrementScore('incorrectSorts')
        s.incrementScore('totalProcessed')
        s.addMoney(-2)
        s.addXP(-10)
        audioManager.playIncorrectSort()
      }
      envelopePool.release(s.heldEnvelope.id)
      s.setHeldEnvelope(null)
      return
    }

    // Wire terminal: process wire envelopes for 10x bps
    if (ud.equipmentType === 'wire_terminal' && s.heldEnvelope) {
      if (s.heldEnvelope.correctSlot === 2) {
        s.incrementScore('correctSorts')
        s.incrementScore('totalProcessed')
        const bonus = Math.abs(s.heldEnvelope.amount) * 0.005
        s.addMoney(bonus + 0.35)
        s.addXP(20)
        audioManager.playCorrectSort()
        addToBatchBin(s.heldEnvelope)
      } else {
        s.incrementScore('incorrectSorts')
        s.incrementScore('totalProcessed')
        s.addMoney(-2)
        s.addXP(-10)
        audioManager.playIncorrectSort()
      }
      envelopePool.release(s.heldEnvelope.id)
      s.setHeldEnvelope(null)
      return
    }

    // Seal batch bin manually
    if (ud.action === 'seal' && ud.equipmentId) {
      sealBin(ud.equipmentId)
      return
    }
  }

  // ══════════════════════════════════════════════
  // HOVER DETECTION
  // ══════════════════════════════════════════════
  const hoverRaycaster = useRef(new THREE.Raycaster())
  const hoverCenter = useRef(new THREE.Vector2(0, 0))
  const lastHoverIdRef = useRef(null)

  // ══════════════════════════════════════════════
  // MAIN SIMULATION FRAME
  // ══════════════════════════════════════════════
  useFrame((_, delta) => {
    const s = storeRef.current
    if (s.phase !== GAME_PHASES.PLAYING) return

    // ─── Hover ───
    hoverRaycaster.current.setFromCamera(hoverCenter.current, camera)
    hoverRaycaster.current.far = hasCamera() ? 12 : 8
    const interactables = []
    scene.traverse((child) => { if (child.userData?.interactable) interactables.push(child) })
    const hits = hoverRaycaster.current.intersectObjects(interactables, true)
    let hoveredObj = null
    if (hits.length > 0) {
      let obj = hits[0].object
      while (obj && !obj.userData?.interactable) obj = obj.parent
      if (obj) hoveredObj = obj
    }
    const hoverId = hoveredObj?.userData?.equipmentId || hoveredObj?.userData?.envelopeId || hoveredObj?.uuid || null
    if (hoverId !== lastHoverIdRef.current) {
      lastHoverIdRef.current = hoverId
      if (hoveredObj) {
        const ud = hoveredObj.userData
        let label = ''
        if (ud.equipmentType === 'envelope') {
          const env = s.activeEnvelopes.find((e) => e.id === ud.envelopeId)
          if (env?.isReturn) label = `RETURN: ${env.merchantName} $${Math.abs(env.amount).toFixed(2)} [${env.returnFlag}]`
          else label = env ? `Pick up: ${env.merchantName} $${Math.abs(env.amount).toFixed(2)}` : 'Pick up'
        } else if (ud.slotIndex !== undefined) {
          const names = ['ACH Debit', 'ACH Credit', 'Wire', 'Recurring', 'RETURNS']
          if (s.heldEnvelope) {
            const isCorrect = s.heldEnvelope.correctSlot === ud.slotIndex
            label = isCorrect ? `DROP HERE: ${names[ud.slotIndex]}` : `${names[ud.slotIndex]} (wrong bin)`
          } else label = names[ud.slotIndex]
        } else if (ud.action === 'seal') label = 'Seal batch'
        else if (ud.equipmentType === 'return_desk') {
          label = s.heldEnvelope?.isReturn
            ? 'PROCESS RETURN HERE (click)'
            : s.heldEnvelope ? 'Not a return — use sorting bins' : 'Return Processing Desk'
        }
        else if (ud.equipmentType === 'auto_sorter') label = 'Auto-Sorter (85%, 2s/env) [X to move]'
        else if (ud.equipmentType === 'stamp_validator') label = 'Validator (90% return catch) [X to move]'
        else if (ud.equipmentType === 'auto_seal_bin') label = 'Auto-Seal Bin (50 cap) [X to move]'
        else if (ud.equipmentType === 'conveyor_extension') label = 'Conveyor [X to move]'
        else if (ud.equipmentType === 'fraud_scanner') label = 'Fraud Scanner (flags >$2k) [X to move]'
        else if (ud.equipmentType === 'speed_belt') label = 'Speed Belt (3x) [X to move]'
        else if (ud.equipmentType === 'duplicate_detector') label = 'Dupe Detector [X to move]'
        else if (ud.equipmentType === 'mega_batch_bin') label = 'Mega Bin (200 cap, auto-seal) [X to move]'
        else if (ud.equipmentType === 'load_balancer') label = 'Load Balancer (parallel sorters) [X to move]'
        else if (ud.equipmentType === 'express_intake') label = '3-Lane Express Intake [X to move]'
        else if (ud.equipmentType === 'ai_sorter') label = 'AI Sorter (95%, 3s/env) [X to move]'
        else if (ud.equipmentType === 'quality_control') label = 'QC Station (catches misroutes) [X to move]'
        else if (ud.equipmentType === 'sameday_vault') label = 'Same-Day Vault (10s, 2x fees) [X to move]'
        else if (ud.equipmentType === 'wire_terminal') {
          label = storeRef.current.heldEnvelope?.correctSlot === 2
            ? 'PROCESS WIRE HERE (10x bps)' : 'Wire Terminal (10x bps) [X to move]'
        }
        else if (ud.equipmentType === 'premium_lane') label = 'Premium Lane ($1k+, 2x bps) [X to move]'
        else if (ud.equipmentType === 'backup_generator') label = 'Generator (prevents blackouts) [X to move]'
        else if (ud.equipmentType === 'hvac_unit') label = 'HVAC (prevents degradation) [X to move]'
        else if (ud.equipmentType === 'surge_buffer') label = 'Surge Buffer (smooths spikes) [X to move]'
        else if (ud.equipmentType === 'surveillance_cam') label = 'Camera [X to move]'
        else if (ud.equipmentType === 'teleport_pad') label = 'Teleport Pad (press T near pad) [X to move]'
        else if (ud.equipmentType === 'staff_desk') label = 'Staff NPC (60%, $50/qtr) [X to move]'
        else if (ud.equipmentType) label = `${ud.equipmentType.replace(/_/g, ' ')} [X to move]`
        else if (ud.portType) label = `Port (${ud.portType})`
        useGameStore.setState({ hoveredTarget: { id: hoverId, label, distance: hits[0].distance } })
      } else {
        useGameStore.setState({ hoveredTarget: null })
      }
    }

    // ─── Game clock ───
    gameClock.tick(delta)
    s.setGameClockTime(gameClock.elapsed)

    // ─── Spawn envelopes ───
    transactionQueue.getSpawnsDue(gameClock.elapsed).forEach((env) => {
      s.spawnEnvelope(envelopePool.acquire(env))
    })

    // ─── Get all equipment by type ───
    const equipment = s.placedEquipment
    const conveyors = equipment.filter((e) => e.type === EQUIPMENT_TYPES.INTAKE_CONVEYOR || e.type === EQUIPMENT_TYPES.EXPRESS_INTAKE)
    const desks = equipment.filter((e) => e.type === EQUIPMENT_TYPES.SORTING_DESK)
    const validators = equipment.filter((e) => e.type === EQUIPMENT_TYPES.STAMP_VALIDATOR)
    const autoSorters = equipment.filter((e) => e.type === EQUIPMENT_TYPES.AUTO_SORTER)
    const aiSorters = equipment.filter((e) => e.type === EQUIPMENT_TYPES.AI_SORTER)
    const allSorters = [...autoSorters, ...aiSorters]
    const hasLoadBalancer = equipment.some((e) => e.type === EQUIPMENT_TYPES.LOAD_BALANCER)
    const conveyorExts = equipment.filter((e) => e.type === EQUIPMENT_TYPES.CONVEYOR_EXTENSION)
    const speedBelts = equipment.filter((e) => e.type === EQUIPMENT_TYPES.SPEED_BELT)
    const premiumLanes = equipment.filter((e) => e.type === EQUIPMENT_TYPES.PREMIUM_LANE)
    const fraudScanners = equipment.filter((e) => e.type === EQUIPMENT_TYPES.FRAUD_SCANNER)
    const dupeDetectors = equipment.filter((e) => e.type === EQUIPMENT_TYPES.DUPLICATE_DETECTOR)
    const qcStations = equipment.filter((e) => e.type === EQUIPMENT_TYPES.QUALITY_CONTROL)
    const staffDesks = equipment.filter((e) => e.type === EQUIPMENT_TYPES.STAFF_DESK)
    const surgeBuffers = equipment.filter((e) => e.type === EQUIPMENT_TYPES.SURGE_BUFFER)
    const hasGenerator = equipment.some((e) => e.type === EQUIPMENT_TYPES.BACKUP_GENERATOR)
    const hasHvac = equipment.some((e) => e.type === EQUIPMENT_TYPES.HVAC_UNIT)
    const vaults = equipment.filter((e) => e.type === EQUIPMENT_TYPES.SETTLEMENT_VAULT)
    const samedayVaults = equipment.filter((e) => e.type === EQUIPMENT_TYPES.SAMEDAY_VAULT)

    // ─── ENVELOPE MOVEMENT: route through equipment chain ───
    const currentEnvelopes = useGameStore.getState().activeEnvelopes
    if (currentEnvelopes.length > 0) {
      let changed = false
      const updated = currentEnvelopes.map((env) => {
        if (!env.position || env.position.y < 0.05) return env

        // Envelopes on the floor (dropped) don't move
        if (env.position.y < 0.15 && Math.abs(env.position.x) < BUILDING.WIDTH / 2 - 3) return env

        // STEP 1: If there's a validator and envelope hasn't been validated, route to validator first
        if (validators.length > 0 && !env.validated) {
          const v = validators[0]
          const vPos = { x: v.position.x, y: 0.85, z: v.position.z }
          const d = dist2d(env.position, vPos)
          if (d > ARRIVAL_THRESHOLD) {
            changed = true
            return { ...env, position: moveToward(env.position, vPos, ENVELOPE_SPEED * 1.2, delta) }
          }
          // At validator — validated below in validator tick
          return env
        }

        // STEP 2: Route to desk (pickup point) if no auto-sorter/AI sorter
        if (desks.length > 0 && allSorters.length === 0) {
          const desk = desks[0]
          const trayPos = { x: desk.position.x + 0.7, y: 1.05, z: desk.position.z }
          const d = dist2d(env.position, trayPos)
          if (d > ARRIVAL_THRESHOLD) {
            changed = true
            return { ...env, position: moveToward(env.position, trayPos, ENVELOPE_SPEED, delta) }
          }
          return { ...env, position: { ...trayPos } }
        }

        // STEP 3: If any sorter exists, route to it (load balancer distributes)
        if (allSorters.length > 0) {
          const sorterIdx = hasLoadBalancer
            ? Math.floor((Date.now() + (env.id?.charCodeAt(4) || 0)) % allSorters.length)
            : 0
          const as = allSorters[sorterIdx]
          const asPos = { x: as.position.x + 1, y: 0.85, z: as.position.z }
          const d = dist2d(env.position, asPos)
          if (d > ARRIVAL_THRESHOLD * 2) {
            changed = true
            return { ...env, position: moveToward(env.position, asPos, ENVELOPE_SPEED * 1.5, delta) }
          }
          // Waiting at auto-sorter — processed below
          return env
        }

        // Fallback: route to desk
        if (desks.length > 0) {
          const desk = desks[0]
          const trayPos = { x: desk.position.x + 0.7, y: 1.05, z: desk.position.z }
          changed = true
          return { ...env, position: moveToward(env.position, trayPos, ENVELOPE_SPEED, delta) }
        }

        return env
      })
      if (changed) useGameStore.setState({ activeEnvelopes: updated })
    }

    // ─── STAMP VALIDATOR: scan and divert returns ───
    validators.forEach((v) => {
      if (isPowerOut) return
      if (!validatorTimers.current[v.id]) validatorTimers.current[v.id] = 0
      validatorTimers.current[v.id] += delta
      if (validatorTimers.current[v.id] < 1.5) return
      validatorTimers.current[v.id] = 0

      const envelopes = useGameStore.getState().activeEnvelopes
      const vPos = v.position
      let target = null
      for (const env of envelopes) {
        if (!env.position || env.validated) continue
        if (dist2d(env.position, vPos) < 2) { target = env; break }
      }
      if (!target) return

      if (target.isReturn && Math.random() < 0.9) {
        // Caught! Divert to side — mark as diverted return, player picks up and takes to return desk
        const store = useGameStore.getState()
        const upd = store.activeEnvelopes.map((e) =>
          e.id === target.id ? { ...e, validated: true, divertedReturn: true, position: { x: vPos.x, y: 0.2, z: vPos.z + 2 } } : e
        )
        useGameStore.setState({ activeEnvelopes: upd })
        audioManager.playIncorrectSort()
      } else {
        // Clean or missed — stamp valid
        const store = useGameStore.getState()
        const upd = store.activeEnvelopes.map((e) =>
          e.id === target.id ? { ...e, validated: true } : e
        )
        useGameStore.setState({ activeEnvelopes: upd })
        audioManager.playStamp()
      }
    })

    // ─── AUTO-SORTER: grab nearby envelopes and sort them ───
    autoSorters.forEach((as) => {
      if (isPowerOut) return
      if (!autoSorterTimers.current[as.id]) autoSorterTimers.current[as.id] = 0
      autoSorterTimers.current[as.id] += delta
      if (autoSorterTimers.current[as.id] < 2) return
      autoSorterTimers.current[as.id] = 0

      const envelopes = useGameStore.getState().activeEnvelopes
      const asPos = as.position
      let target = null
      for (const env of envelopes) {
        if (!env.position || env.divertedReturn) continue
        if (dist2d(env.position, asPos) < 3.5) { target = env; break }
      }
      if (!target) return

      // Don't auto-sort diverted returns — those need manual return desk
      if (target.divertedReturn) return

      // HVAC affects accuracy: without it, -15% accuracy
      const baseAccuracy = 0.85
      const accuracy = hasHvac ? baseAccuracy : baseAccuracy - 0.15
      const isCorrect = Math.random() < accuracy
      const slot = isCorrect ? target.correctSlot : Math.floor(Math.random() * 5)

      const store = useGameStore.getState()
      store.removeEnvelope(target.id)
      scoreEnvelope(target, slot)
      envelopePool.release(target.id)
    })

    // ─── CONVEYOR EXTENSIONS: move nearby envelopes along the belt direction ───
    conveyorExts.forEach((belt) => {
      const bPos = belt.position
      const envelopes = useGameStore.getState().activeEnvelopes
      let changed = false
      const upd = envelopes.map((env) => {
        if (!env.position) return env
        const d = dist2d(env.position, bPos)
        if (d < 3 && env.position.y > 0.5) {
          // Move envelope along belt (toward negative X by default — toward the west wall / bins)
          changed = true
          return {
            ...env,
            position: {
              x: env.position.x - ENVELOPE_SPEED * 1.5 * delta,
              y: 0.85,
              z: env.position.z + (bPos.z - env.position.z) * delta * 2,
            },
          }
        }
        return env
      })
      if (changed) useGameStore.setState({ activeEnvelopes: upd })
    })

    // ─── SPEED BELTS: 3x speed conveyors ───
    speedBelts.forEach((belt) => {
      const bPos = belt.position
      const envelopes = useGameStore.getState().activeEnvelopes
      let changed = false
      const upd = envelopes.map((env) => {
        if (!env.position) return env
        const d = dist2d(env.position, bPos)
        if (d < 3 && env.position.y > 0.5) {
          changed = true
          return {
            ...env,
            position: {
              x: env.position.x - ENVELOPE_SPEED * 3 * delta,
              y: 0.85,
              z: env.position.z + (bPos.z - env.position.z) * delta * 3,
            },
          }
        }
        return env
      })
      if (changed) useGameStore.setState({ activeEnvelopes: upd })
    })

    // ─── FRAUD SCANNER: flags high-value transactions as returns ───
    fraudScanners.forEach((fs) => {
      if (isPowerOut) return
      if (!fraudScannerTimers.current[fs.id]) fraudScannerTimers.current[fs.id] = 0
      fraudScannerTimers.current[fs.id] += delta
      if (fraudScannerTimers.current[fs.id] < 1.2) return
      fraudScannerTimers.current[fs.id] = 0

      const envelopes = useGameStore.getState().activeEnvelopes
      const fsPos = fs.position
      let target = null
      for (const env of envelopes) {
        if (!env.position || env.fraudScanned) continue
        if (dist2d(env.position, fsPos) < 2.5) { target = env; break }
      }
      if (!target) return

      if (target.amount > 2000 && !target.isReturn) {
        const store = useGameStore.getState()
        const upd = store.activeEnvelopes.map((e) =>
          e.id === target.id ? {
            ...e, fraudScanned: true, isReturn: true, returnFlag: 'R29',
            correctSlot: 4, color: 0xff2222,
            divertedReturn: true,
            position: { x: fsPos.x, y: 0.2, z: fsPos.z + 2 },
          } : e
        )
        useGameStore.setState({ activeEnvelopes: upd })
        audioManager.playIncorrectSort()
      } else {
        const store = useGameStore.getState()
        const upd = store.activeEnvelopes.map((e) =>
          e.id === target.id ? { ...e, fraudScanned: true } : e
        )
        useGameStore.setState({ activeEnvelopes: upd })
      }
    })

    // ─── DUPLICATE DETECTOR: catches same merchant+amount in a row ───
    dupeDetectors.forEach((dd) => {
      if (isPowerOut) return
      if (!dupeDetectorTimers.current[dd.id]) dupeDetectorTimers.current[dd.id] = 0
      dupeDetectorTimers.current[dd.id] += delta
      if (dupeDetectorTimers.current[dd.id] < 1) return
      dupeDetectorTimers.current[dd.id] = 0

      const envelopes = useGameStore.getState().activeEnvelopes
      const ddPos = dd.position
      let target = null
      for (const env of envelopes) {
        if (!env.position || env.dupeChecked) continue
        if (dist2d(env.position, ddPos) < 2) { target = env; break }
      }
      if (!target) return

      const isDupe = lastDupeRef.current &&
        lastDupeRef.current.merchantName === target.merchantName &&
        Math.abs(lastDupeRef.current.amount - target.amount) < 0.01

      lastDupeRef.current = { merchantName: target.merchantName, amount: target.amount }

      if (isDupe && !target.isReturn) {
        const store = useGameStore.getState()
        const upd = store.activeEnvelopes.map((e) =>
          e.id === target.id ? {
            ...e, dupeChecked: true, isReturn: true, returnFlag: 'R03',
            correctSlot: 4, color: 0xff2222,
            divertedReturn: true,
            position: { x: ddPos.x, y: 0.2, z: ddPos.z + 2 },
          } : e
        )
        useGameStore.setState({ activeEnvelopes: upd })
        audioManager.playIncorrectSort()
      } else {
        const store = useGameStore.getState()
        const upd = store.activeEnvelopes.map((e) =>
          e.id === target.id ? { ...e, dupeChecked: true } : e
        )
        useGameStore.setState({ activeEnvelopes: upd })
      }
    })

    // ─── AI SORTER: 95% accuracy, 3s per envelope ───
    aiSorters.forEach((ai) => {
      if (isPowerOut) return
      if (!aiSorterTimers.current[ai.id]) aiSorterTimers.current[ai.id] = 0
      aiSorterTimers.current[ai.id] += delta
      if (aiSorterTimers.current[ai.id] < 3) return
      aiSorterTimers.current[ai.id] = 0

      const envelopes = useGameStore.getState().activeEnvelopes
      let target = null
      for (const env of envelopes) {
        if (!env.position || env.divertedReturn) continue
        if (dist2d(env.position, ai.position) < 3.5) { target = env; break }
      }
      if (!target) return

      const aiAccuracy = hasHvac ? 0.95 : 0.80
      const isCorrect = Math.random() < aiAccuracy
      const slot = isCorrect ? target.correctSlot : Math.floor(Math.random() * 5)
      useGameStore.getState().removeEnvelope(target.id)
      scoreEnvelope(target, slot)
      envelopePool.release(target.id)
    })

    // ─── QUALITY CONTROL: re-checks auto-sorter output, catches 80% of misroutes ───
    qcStations.forEach((qc) => {
      if (!qcTimers.current[qc.id]) qcTimers.current[qc.id] = 0
      qcTimers.current[qc.id] += delta
      if (qcTimers.current[qc.id] < 1.5) return
      qcTimers.current[qc.id] = 0

      // QC increases accuracy of all auto-sorters retroactively by adding bonus XP
      const store = useGameStore.getState()
      if (store.score.incorrectSorts > 0 && Math.random() < 0.3) {
        store.incrementScore('incorrectSorts', -1)
        store.incrementScore('correctSorts')
        store.addXP(5)
      }
    })

    // ─── PREMIUM LANE: envelopes >$1000 near it earn 2x bps ───
    premiumLanes.forEach((pl) => {
      const envelopes = useGameStore.getState().activeEnvelopes
      envelopes.forEach((env) => {
        if (!env.position || env.premiumProcessed) return
        if (env.amount > 1000 && dist2d(env.position, pl.position) < 3) {
          const bonus = Math.abs(env.amount) * 0.0005
          useGameStore.getState().addMoney(bonus)
          const upd = useGameStore.getState().activeEnvelopes.map((e) =>
            e.id === env.id ? { ...e, premiumProcessed: true } : e
          )
          useGameStore.setState({ activeEnvelopes: upd })
        }
      })
    })

    // ─── STAFF NPC: auto-sort at 60% accuracy, 4s/envelope ───
    staffDesks.forEach((sd) => {
      if (isPowerOut) return
      if (!staffTimers.current[sd.id]) staffTimers.current[sd.id] = 0
      staffTimers.current[sd.id] += delta
      if (staffTimers.current[sd.id] < 4) return
      staffTimers.current[sd.id] = 0

      const envelopes = useGameStore.getState().activeEnvelopes
      let target = null
      for (const env of envelopes) {
        if (!env.position || env.divertedReturn) continue
        if (dist2d(env.position, sd.position) < 4) { target = env; break }
      }
      if (!target) return

      const isCorrect = Math.random() < 0.6
      const slot = isCorrect ? target.correctSlot : Math.floor(Math.random() * 5)
      useGameStore.getState().removeEnvelope(target.id)
      scoreEnvelope(target, slot)
      envelopePool.release(target.id)
    })

    // ─── SURGE BUFFER: absorb bursts, release steadily ───
    if (surgeBuffers.length > 0) {
      const store = useGameStore.getState()
      const envelopes = store.activeEnvelopes
      const buf = surgeBuffers[0]
      // Absorb: if >5 envelopes within range, buffer the excess
      const nearby = envelopes.filter((e) => e.position && dist2d(e.position, buf.position) < 4 && e.position.y > 0.5)
      if (nearby.length > 5) {
        const toBuffer = nearby.slice(5)
        toBuffer.forEach((env) => {
          surgeBufferRef.current.push(env)
          store.removeEnvelope(env.id)
        })
        const upd = store.placedEquipment.map((eq) =>
          eq.id === buf.id ? { ...eq, bufferedCount: surgeBufferRef.current.length } : eq
        )
        useGameStore.setState({ placedEquipment: upd })
      }
      // Release: one every 2 seconds
      surgeReleaseTimer.current += delta
      if (surgeReleaseTimer.current >= 2 && surgeBufferRef.current.length > 0) {
        surgeReleaseTimer.current = 0
        const released = surgeBufferRef.current.shift()
        released.position = { x: buf.position.x + 2, y: 0.85, z: buf.position.z }
        store.spawnEnvelope(released)
        const upd = store.placedEquipment.map((eq) =>
          eq.id === buf.id ? { ...eq, bufferedCount: surgeBufferRef.current.length } : eq
        )
        useGameStore.setState({ placedEquipment: upd })
      }
    }

    // ─── POWER OUTAGE events (if no generator) ───
    const isPowerOut = powerOutageRef.current.active
    if (!hasGenerator) {
      powerOutageRef.current.timer += delta
      if (!powerOutageRef.current.active && powerOutageRef.current.timer >= powerOutageRef.current.nextEvent) {
        powerOutageRef.current.active = true
        powerOutageRef.current.timer = 0
        powerOutageRef.current.nextEvent = 90 + Math.random() * 180
        useGameStore.getState().setScreenFlash({ color: '#000000', duration: 500 })
        useGameStore.getState().setActiveCrisis({ type: 'power_outage', name: 'POWER OUTAGE', color: 'rgba(0,0,0,0.6)', multiplier: 1, duration: 10, startTime: crisisTimerRef.current })
        audioManager.playCrisisAlarm()
      }
      if (powerOutageRef.current.active) {
        powerOutageRef.current.timer += delta
        if (powerOutageRef.current.timer >= 10) {
          powerOutageRef.current.active = false
          powerOutageRef.current.timer = 0
          useGameStore.getState().setActiveCrisis(null)
        }
      }
    }

    // ─── SETTLEMENT VAULT cycle ───
    const allVaults = [...vaults, ...samedayVaults]
    allVaults.forEach((vault) => {
      const isSameDay = vault.type === EQUIPMENT_TYPES.SAMEDAY_VAULT
      const cycleTime = isSameDay ? 10 : 30
      const feeMultiplier = isSameDay ? 2 : 1

      if (!vault._settleTimer) vault._settleTimer = 0
      vault._settleTimer = (vault._settleTimer || 0) + delta

      if (vault._settleTimer >= cycleTime) {
        vault._settleTimer = 0
        audioManager.playVaultSettle()
        const updatedEq = useGameStore.getState().placedEquipment.map((eq) =>
          eq.id === vault.id ? { ...eq, isSettling: true } : eq
        )
        useGameStore.setState({ placedEquipment: updatedEq })
        setTimeout(() => {
          const eq2 = useGameStore.getState().placedEquipment.map((eq) =>
            eq.id === vault.id ? { ...eq, isSettling: false } : eq
          )
          useGameStore.setState({ placedEquipment: eq2 })
        }, isSameDay ? 1500 : 3000)
      }
    })

    // ─── AMBIENT MUSIC ───
    if (!ambientStartedRef.current) {
      audioManager.startAmbient()
      ambientStartedRef.current = true
    }
    audioManager.updateAmbientActivity(useGameStore.getState().activeEnvelopes.length)

    // ─── CRISIS EVENTS ───
    crisisTimerRef.current += delta
    const gameProgress = gameClock.getProgress()
    const currentCrisis = useGameStore.getState().activeCrisis

    if (!currentCrisis && crisisTimerRef.current - lastCrisisRef.current > 60) {
      let crisis = null
      const q = gameClock.getCurrentQuarter()

      if (q >= 3 && q <= 4 && Math.random() < 0.01) {
        crisis = { type: 'holiday_rush', name: 'HOLIDAY RUSH', color: 'rgba(255,200,0,0.2)', multiplier: 3, duration: 30 }
      } else if (Math.random() < 0.005) {
        crisis = { type: 'payday_flood', name: 'PAYDAY FLOOD', color: 'rgba(0,255,100,0.15)', multiplier: 2.5, duration: 15 }
      } else if (q >= 4 && Math.random() < 0.008) {
        crisis = { type: 'black_friday', name: 'BLACK FRIDAY', color: 'rgba(255,0,0,0.2)', multiplier: 5, duration: 20 }
      } else if (Math.random() < 0.003) {
        crisis = { type: 'subscription_swarm', name: 'SUBSCRIPTION SWARM', color: 'rgba(150,100,255,0.15)', multiplier: 2, duration: 12 }
      }

      if (crisis) {
        crisis.startTime = crisisTimerRef.current
        useGameStore.setState({ activeCrisis: crisis })
        audioManager.playCrisisAlarm()
        audioManager.setCrisisAmbient(true)
        lastCrisisRef.current = crisisTimerRef.current
      }
    }

    if (currentCrisis && crisisTimerRef.current - currentCrisis.startTime > currentCrisis.duration) {
      useGameStore.setState({ activeCrisis: null })
      audioManager.setCrisisAmbient(false)
    }

    // ─── DIFFICULTY SCALING ───
    const quarterMultipliers = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5]
    const diffMult = quarterMultipliers[Math.min(gameClock.getCurrentQuarter(), 7)] || 1
    const crisisMult = currentCrisis?.multiplier || 1
    gameClock.speed = diffMult * crisisMult

    // ─── ACHIEVEMENT CHECKING ───
    achievementCheckerRef.current += delta
    if (achievementCheckerRef.current > 5) {
      achievementCheckerRef.current = 0
      const st = useGameStore.getState()
      const sc = st.score
      if (sc.totalProcessed >= 10 && !st.achievements.find((a) => a.id === 'first10')) {
        st.addAchievement({ id: 'first10', title: 'Getting Started', desc: '10 transactions processed' })
        audioManager.playAchievement()
      }
      if (sc.totalProcessed >= 100 && !st.achievements.find((a) => a.id === 'century')) {
        st.addAchievement({ id: 'century', title: 'Century Club', desc: '100 transactions processed' })
        audioManager.playAchievement()
      }
      if (sc.totalProcessed >= 500 && !st.achievements.find((a) => a.id === 'highvolume')) {
        st.addAchievement({ id: 'highvolume', title: 'High Volume', desc: '500 transactions processed' })
        audioManager.playAchievement()
      }
      if (st.money >= 10000 && !st.achievements.find((a) => a.id === 'rich')) {
        st.addAchievement({ id: 'rich', title: 'Money Maker', desc: '$10,000 earned' })
        audioManager.playAchievement()
      }
      if (st.comboCount >= 10 && !st.achievements.find((a) => a.id === 'combo10')) {
        st.addAchievement({ id: 'combo10', title: 'On a Roll', desc: '10x combo streak' })
        audioManager.playAchievement()
      }
      if (sc.correctSorts > 0 && sc.incorrectSorts === 0 && sc.totalProcessed >= 50 && !st.achievements.find((a) => a.id === 'perfect50')) {
        st.addAchievement({ id: 'perfect50', title: 'Flawless', desc: '50 sorts with zero errors' })
        audioManager.playAchievement()
      }
      if (st.placedEquipment.length >= 10 && !st.achievements.find((a) => a.id === 'builder')) {
        st.addAchievement({ id: 'builder', title: 'Master Builder', desc: '10 equipment pieces placed' })
        audioManager.playAchievement()
      }
    }

    // ─── Quarter transitions ───
    const currentQ = gameClock.getCurrentQuarter()
    if (currentQ > lastQuarterRef.current && currentQ < 8) {
      lastQuarterRef.current = currentQ
      s.advanceQuarter()

      // Deduct operating costs: $15 per equipment + $50 per staff NPC
      const staffCount = equipment.filter((e) => e.type === EQUIPMENT_TYPES.STAFF_DESK).length
      const opCost = scoringEngine.calculateOperatingCosts(equipment.length) + (staffCount * 50)
      if (opCost > 0) s.addMoney(-opCost)

      s.setPhase(GAME_PHASES.BUILD_PHASE)
    }

    // ─── Game end ───
    if (gameClock.isFinished() && transactionQueue.isComplete()) {
      if (useGameStore.getState().activeEnvelopes.length === 0) {
        gameClock.pause()
        s.setPhase(GAME_PHASES.ENDED)
      }
    }
  })

  return null
}
