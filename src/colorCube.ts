import { three } from "./alias"

/// cube ///
let cubeVertexToFaceVertexAndColorMap: Record<
  number,
  [[number, number, number], [number, number, number], string]
> = {
  [0]: [[5, 10, 16], [1, 1, 1], "white"],
  [1]: [[4, 8, 2_1], [0, 1, 1], "cyan"],
  [2]: [[0, 11, 17], [1, 0, 1], "magenta"],
  [3]: [[7, 12, 18], [1, 1, 0], "yellow"],
  [4]: [[2, 13, 19], [1, 0, 0], "red"],
  [5]: [[6, 14, 23], [0, 1, 0], "green"],
  [6]: [[1, 9, 2_0], [0, 0, 1], "blue"],
  [7]: [[3, 15, 22], [0, 0, 0], "black"],
}

let faceVertexColorArray = new Array(24)

Object.values(cubeVertexToFaceVertexAndColorMap).forEach(([[u, v, w], color]) => {
  faceVertexColorArray[u] = color
  faceVertexColorArray[v] = color
  faceVertexColorArray[w] = color
})

// flatten
let colorBuffer = [].concat(...faceVertexColorArray)

export interface ColorCubeParam {
  clippingPlanes?: three.Plane[]
}

export function createColorCube(param: ColorCubeParam): three.Mesh {
  let { clippingPlanes = [] } = param
  let cubeGeometry = new three.BoxGeometry(1, 1, 1)
  cubeGeometry.setAttribute("color", new three.Float32BufferAttribute(colorBuffer, 3))
  let cubeMaterial = new three.MeshBasicMaterial({
    vertexColors: true,
    clippingPlanes,
    side: three.DoubleSide,
  })

  return new three.Mesh(cubeGeometry, cubeMaterial)
}
