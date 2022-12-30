import { three } from "../alias"

export interface UserRotableOnRotateParam {
  rotationMatrix: three.Matrix4
  buttons: number
}

export interface UserRotatableParam {
  onRotate: ({}: UserRotableOnRotateParam) => void
}

export function setupUserRotation(param: UserRotatableParam) {
  let { onRotate } = param
  let isDragging = false
  let lastPosition = { x: 0, y: 0 }

  let rotationMatrix = new three.Matrix4()
  let euler = new three.Euler()

  function updateRotationMatrix(dx: number, dy: number) {
    euler.x = dx
    euler.y = dy
    rotationMatrix.makeRotationFromEuler(euler)
  }

  function handleStart(x: number, y: number) {
    isDragging = true
    lastPosition.x = x
    lastPosition.y = y
  }

  function handleMove(x: number, y: number, buttons: number) {
    if (isDragging) {
      updateRotationMatrix((y - lastPosition.y) * 0.006, (x - lastPosition.x) * 0.006)
      onRotate({ rotationMatrix, buttons })
    }
    lastPosition = { x, y }
  }

  function handleEnd(ev: MouseEvent | TouchEvent) {
    if ((ev as MouseEvent).buttons === 0) {
      isDragging = false
    }
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
    handleMove(ev.clientX, ev.clientY, ev.buttons)
  })
  documentElement.addEventListener("touchmove", (ev) => {
    let x = ev.touches[0].clientX
    let y = ev.touches[0].clientY
    handleMove(x, y, 4)
  })
  document.addEventListener("mouseup", handleEnd)
  document.addEventListener("touchend", handleEnd)
  document.addEventListener("touchcancel", handleEnd)
}
