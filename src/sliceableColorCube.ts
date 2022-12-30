import { Vector3 } from "three"
import { three } from "./alias"
import { createColorCube } from "./colorCube"

export function createSliceableColorCube(param: any) {
  let plane = new three.Plane(new Vector3(1, 1, 1).normalize())

  let cube = createColorCube({ clippingPlanes: [plane] })

  return { cube, plane }
}
