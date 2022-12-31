import { three } from "./alias"
import { createColorCube } from "./colorCube"
import { createCubeFiller } from "./cubeFiller"

export interface SliceableColorCubeParam {}

export interface UpdateCubeParam {
  cubeRotation?: three.Matrix4
  planeRotation?: three.Matrix4
  cubeAndPlaneRotation?: three.Matrix4
  planeConstant?: number
}

export function createSliceableColorCube(param: SliceableColorCubeParam) {
  let plane = new three.Plane(new three.Vector3(1, 1, 1).normalize())

  let cube = createColorCube({ clippingPlanes: [plane] })
  let { filler, updateFiller } = createCubeFiller()

  let update = (param: UpdateCubeParam) => {
    let { cubeAndPlaneRotation, cubeRotation, planeRotation, planeConstant } = param
    let fillerNeedsUpdate = false
    if (cubeAndPlaneRotation) {
      if (cubeRotation || planeRotation) {
        throw new Error("bad cube update parameter")
      }
      cube.applyMatrix4(cubeAndPlaneRotation)
      plane.applyMatrix4(cubeAndPlaneRotation)
    }
    if (cubeRotation) {
      cube.applyMatrix4(cubeRotation)
      fillerNeedsUpdate = true
    }
    if (planeRotation) {
      plane.applyMatrix4(planeRotation)
      fillerNeedsUpdate = true
    }
    if (planeConstant) {
      plane.constant = planeConstant
      fillerNeedsUpdate = true
    }

    updateFiller(cube.matrixWorld, plane)
  }

  return { cube, filler, plane, update }
}
