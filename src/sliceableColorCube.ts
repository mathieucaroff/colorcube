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
  let plane = new three.Plane(new three.Vector3(1, -1, -1).normalize())

  let cube = createColorCube({ clippingPlanes: [plane] })
  let { filler, updateFiller } = createCubeFiller()

  let identityMatrix = new three.Matrix4()

  let updateCube = (param: UpdateCubeParam) => {
    let { cubeAndPlaneRotation, cubeRotation, planeRotation, planeConstant } = param

    // Apparently, the cube.matrixWorld isn't updated right away when the
    // rotation matrix is applied, so here we define an extra rotation matrix
    // which receives the missing rotation and is passed down to updateFiller()
    let rotation = identityMatrix

    if (cubeAndPlaneRotation) {
      if (cubeRotation || planeRotation) {
        throw new Error("bad cube update parameter")
      }
      cube.applyMatrix4(cubeAndPlaneRotation)
      plane.applyMatrix4(cubeAndPlaneRotation)
      rotation = cubeAndPlaneRotation
    }
    if (cubeRotation) {
      cube.applyMatrix4(cubeRotation)
      rotation = cubeRotation
    }
    if (planeRotation) {
      plane.applyMatrix4(planeRotation)
    }
    if (planeConstant) {
      plane.constant = planeConstant
    }

    updateFiller(cube.matrixWorld, rotation, plane)
  }

  updateCube({})

  return { cube, filler, plane, updateCube }
}
