import * as THREE from 'three'

const BASE_RANGE = 6
const EXTENDED_RANGE = 10
const raycaster = new THREE.Raycaster()
const center = new THREE.Vector2(0, 0)

export function getInteractionTarget(camera, interactables, extendedRange = false) {
  raycaster.far = extendedRange ? EXTENDED_RANGE : BASE_RANGE
  raycaster.setFromCamera(center, camera)
  const intersections = raycaster.intersectObjects(interactables, true)
  if (intersections.length === 0) return null

  let obj = intersections[0].object
  while (obj && !obj.userData?.interactable) {
    obj = obj.parent
  }
  if (!obj) return null

  return {
    object: obj,
    point: intersections[0].point,
    distance: intersections[0].distance,
  }
}

export function getGridPosition(camera, gridY = 0) {
  raycaster.setFromCamera(center, camera)
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -gridY)
  const target = new THREE.Vector3()
  raycaster.ray.intersectPlane(plane, target)
  if (!target) return null
  target.x = Math.round(target.x)
  target.z = Math.round(target.z)
  return target
}
