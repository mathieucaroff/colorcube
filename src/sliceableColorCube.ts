import { three } from "./alias"
import { createColorCube } from "./colorCube"

export interface SliceableColorCubeParam {}

export function createSliceableColorCube(param: SliceableColorCubeParam) {
  let plane = new three.Plane(new three.Vector3(1, 1, 1).normalize())

  let cube = createColorCube({ clippingPlanes: [plane] })
  let { filler, update } = createFiller()

  return { cube, filler, plane, update }
}

const halfForward = new three.Vector3(0.5, 0.5, 0.5)

const unitBoxVertices = {
  a: new three.Vector3(-1, -1, -1),
  b: new three.Vector3(-1, -1, 1),
  c: new three.Vector3(-1, 1, -1),
  d: new three.Vector3(1, -1, -1),
  e: new three.Vector3(-1, 1, 1),
  f: new three.Vector3(1, -1, 1),
  g: new three.Vector3(1, 1, -1),
  h: new three.Vector3(1, 1, 1),
}

function createFiller() {
  // initialize the eight corner vectors
  const s = Object.fromEntries(
    Object.entries(unitBoxVertices).map(([name, vector]) => [name, vector.clone()]),
  )
  // initialize the twelve lines from these eight vectors
  const boxEdges = [
    new three.Line3(s.a, s.b),
    new three.Line3(s.a, s.c),
    new three.Line3(s.a, s.d),
    new three.Line3(s.b, s.e),
    new three.Line3(s.b, s.f),
    new three.Line3(s.c, s.e),
    new three.Line3(s.c, s.g),
    new three.Line3(s.d, s.f),
    new three.Line3(s.d, s.g),
    new three.Line3(s.e, s.h),
    new three.Line3(s.f, s.h),
    new three.Line3(s.g, s.h),
  ]

  // Filler
  let filler = new three.Group()

  let polygon = Array.from({ length: 7 }, () => new three.Vector3())
  let colorArray = Array.from({ length: 21 * 5 }, () => 0.5)
  let colorBuffer = new three.Float32BufferAttribute(colorArray, 3)
  let polyGeometry = new three.BufferGeometry()
  polyGeometry.setAttribute("color", colorBuffer)
  polyGeometry.setAttribute(
    "position",
    new three.Float32BufferAttribute(
      ([] as number[]).concat(...polygon.map((x) => x.toArray())),
      3,
    ),
  )
  filler.add(
    new three.Mesh(
      polyGeometry,
      new three.MeshBasicMaterial({ vertexColors: true, side: three.DoubleSide }),
    ),
  )

  const update = (boxMatrix: three.Matrix4, plane: three.Plane) => {
    // update the eight vertex vectors: reset them then apply the rotation
    Object.entries(s).forEach(([name, vector]) => {
      vector
        .copy((unitBoxVertices as any)[name])
        .multiplyScalar(0.5)
        .applyMatrix4(boxMatrix)
    })
    //
    let degree = 0
    let inverseBoxMatrix = boxMatrix.clone().invert()
    boxEdges.forEach((edge) => {
      let intersection = plane.intersectLine(edge, polygon[degree])
      if (intersection !== null) {
        // compute color from position
        let position = intersection.clone().applyMatrix4(inverseBoxMatrix)
        let [x, y, z] = position.add(halfForward).toArray()
        colorArray[3 * degree] = z // red
        colorArray[3 * degree + 1] = 1 - x // green
        colorArray[3 * degree + 2] = y // blue
        degree++
      }
    })
    let arraySize = 3 * degree
    for (let k = arraySize; k < 5 * arraySize; k++) {
      colorArray[k] = colorArray[k % arraySize]
    }

    let slicedPolygon = polygon.slice(0, degree)
    let repeatedPolygon = ([] as three.Vector3[]).concat(
      ...Array.from({ length: 5 }, () => slicedPolygon),
    )

    colorBuffer.set(colorArray)
    colorBuffer.needsUpdate = true
    polyGeometry.setAttribute("color", colorBuffer)
    polyGeometry.setFromPoints(repeatedPolygon)
  }

  return { filler, update }
}
