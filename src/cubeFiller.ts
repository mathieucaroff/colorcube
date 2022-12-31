import { three } from "./alias"
import { createColorfulPolyhedron } from "./colorfulPolyhedron"

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

export function createCubeFiller() {
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

  let polygon = Array.from({ length: 6 }, () => new three.Vector3())
  let colorArray = Array.from({ length: 21 * 5 }, () => 0.5)

  // Filler polyhedron
  let { polyhedron, updatePolyhedron } = createColorfulPolyhedron(6)
  filler.add(polyhedron)
  let polyColorArray = Array.from({ length: 6 }, () => new three.Color())

  const updateFiller = (
    boxMatrix: three.Matrix4,
    extraRotation: three.Matrix4,
    plane: three.Plane,
  ) => {
    // update the eight vertex vectors: reset them then apply the rotation
    Object.entries(s).forEach(([name, vector]) => {
      vector
        .copy((unitBoxVertices as any)[name])
        .multiplyScalar(0.5)
        .applyMatrix4(boxMatrix)
        .applyMatrix4(extraRotation)
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
        polyColorArray[degree].setRGB(z, 1 - x, y)
        degree++
      }
    })
    let arraySize = 3 * degree
    for (let k = arraySize; k < 5 * arraySize; k++) {
      colorArray[k] = colorArray[k % arraySize]
    }
    // update the polyhedron
    updatePolyhedron(polyColorArray.slice(0, degree), polygon.slice(0, degree))
  }

  return { filler, updateFiller }
}
