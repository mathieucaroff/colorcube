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
  let colorArray = Array.from({ length: 7 }, () => new three.Color())
  let polyGeometry = new three.BufferGeometry()
  let polyMaterial = new three.MeshBasicMaterial({ vertexColors: true, side: three.DoubleSide })
  filler.add(new three.Mesh(polyGeometry, polyMaterial))

  // Updating the geometry
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
        colorArray[degree].setRGB(z, 1 - x, y)
        degree++
      }
    })
    setGemometry(polyGeometry, colorArray, polygon.slice(0, degree))
  }

  return { filler, update }
}

function setGemometry(
  geometry: three.BufferGeometry,
  colorArray: three.Color[],
  positionArray: three.Vector3[],
) {
  let colorList: number[] = []
  let positionList: three.Vector3[] = []
  for (let k = 2; k < positionArray.length; k++) {
    for (let m = 1; m < k; m++) {
      for (let n = 0; n < m; n++) {
        positionList.push(positionArray[k], positionArray[m], positionArray[n])
        colorList.push(
          ...colorArray[k].toArray(),
          ...colorArray[m].toArray(),
          ...colorArray[n].toArray(),
        )
      }
    }
  }
  geometry.setAttribute("color", new three.Float32BufferAttribute(colorList, 3))
  geometry.setFromPoints(positionList)
}
