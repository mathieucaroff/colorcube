import { clamp } from "../utils/clamp"

export interface UserRotableOnRotateParam {}

export interface UserRotatableParam {
  onLevelChange: (level: number, param: UserRotableOnRotateParam) => void
  min: number
  max: number
}

export function setupUserScrollLevel(param: UserRotatableParam) {
  let { min, max, onLevelChange } = param
  let level = clamp(0, min, max)
  const onMouseWheel = (ev: WheelEvent) => {
    ev.preventDefault()
    level = clamp(level + clamp(-ev.deltaY * 0.002, -0.166, 0.166), min, max)
    onLevelChange(level, {})
  }

  document.addEventListener("wheel", onMouseWheel, {
    capture: true,
    passive: false,
  })
}
