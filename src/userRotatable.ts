import { three } from "./alias"

export interface UserRotatableParam {
  onRotate: () => void
  rotationCallback?: (rotationMatrix: three.Matrix4) => void
}

export function createUserRotatable(param: UserRotatableParam) {
  let { onRotate, rotationCallback } = param
  let rotatable = new three.Group()
  let isDragging = false
  let lastPosition = { x: 0, y: 0 }

  let rotationMatrix = new three.Matrix4()
  let euler = new three.Euler()

  function rotateGroup(dx: number, dy: number) {
    euler.x = dx
    euler.y = dy
    rotationMatrix.makeRotationFromEuler(euler)
    rotatable.applyMatrix4(rotationMatrix)
    rotationCallback?.(rotationMatrix)
  }

  function handleStart(x: number, y: number) {
    isDragging = true
    lastPosition.x = x
    lastPosition.y = y
  }

  function handleMove(x: number, y: number) {
    if (isDragging) {
      rotateGroup((y - lastPosition.y) * 0.006, (x - lastPosition.x) * 0.006)
      onRotate()
    }
    lastPosition = { x, y }
  }

  function handleEnd() {
    isDragging = false
  }

  let { documentElement } = document

  documentElement.addEventListener("mousedown", (ev) => {
    handleStart(ev.clientX, ev.clientY)
  })
  documentElement.addEventListener("touchstart", (ev) => {
    ev.preventDefault()
    ev.stopImmediatePropagation()
    let x = ev.touches[0].clientX
    let y = ev.touches[0].clientY
    handleStart(x, y)
  })
  documentElement.addEventListener("mousemove", (ev) => {
    handleMove(ev.clientX, ev.clientY)
  })
  documentElement.addEventListener("touchmove", (ev) => {
    let x = ev.touches[0].clientX
    let y = ev.touches[0].clientY
    handleMove(x, y)
  })
  document.addEventListener("mouseup", handleEnd)
  document.addEventListener("touchend", handleEnd)
  document.addEventListener("touchcancel", handleEnd)

  return rotatable
}
