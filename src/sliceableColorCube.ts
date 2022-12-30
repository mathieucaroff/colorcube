import { PolyhedronBufferGeometry } from "three"
import { three } from "./alias"
import { createColorCube } from "./colorCube"

export interface SliceableColorCubeParam {}

export function createSliceableColorCube(param: SliceableColorCubeParam) {
  let plane = new three.Plane(new three.Vector3(1, 1, 1).normalize())

  let cube = createColorCube({ clippingPlanes: [plane] })
  let filler = createFiller()

  return { cube, filler, plane }
}

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

// TODO: optimize the computations to not use applyMatrix4 24 times in total,
// since it's possible to do it with just 8 applications.
const s = unitBoxVertices
const unitBoxEdgeVertices = [
  [s.a, s.b],
  [s.a, s.c],
  [s.a, s.d],
  [s.b, s.e],
  [s.b, s.f],
  [s.c, s.e],
  [s.c, s.g],
  [s.d, s.f],
  [s.d, s.g],
  [s.e, s.h],
  [s.f, s.h],
  [s.g, s.h],
]

function createFiller() {
  let filler = new three.Group()

  let line = new three.Line3()
  let sphereArray: three.Mesh<three.SphereGeometry, three.MeshBasicMaterial>[] = []
  let polygon = Array.from({ length: 7 }, () => {
    let s = new three.SphereGeometry(0.06)
    let ma = new three.MeshBasicMaterial({ color: "blue" })
    let me = new three.Mesh(s, ma)
    sphereArray.push(me)
    filler.add(me)
    return me.position
  })
  let colorArray = Array.from({ length: 21 }, () => 0.5)
  let colorBuffer = new three.Float32BufferAttribute(colorArray, 3)
  let polyGeometry = new PolyhedronBufferGeometry([], [])
  polyGeometry.setAttribute("color", colorBuffer)
  filler.add(
    new three.Mesh(
      polyGeometry,
      new three.MeshBasicMaterial({ vertexColors: true, side: three.DoubleSide }),
    ),
  )

  const update = (boxMatrix: three.Matrix4, plane: three.Plane) => {
    let degree = 0
    let inverseBoxMatrix = boxMatrix.clone().invert()
    unitBoxEdgeVertices.forEach(([a, b], k) => {
      line.start.copy(a).multiplyScalar(0.5)
      line.end.copy(b).multiplyScalar(0.5)
      line.applyMatrix4(boxMatrix)
      let intersection = plane.intersectLine(line, polygon[degree])
      if (intersection !== null) {
        sphereArray[degree].visible = true
        let position = intersection.clone().applyMatrix4(inverseBoxMatrix)
        let color = colorFromPosition(position)
        sphereArray[degree].material.color = color
        colorArray[3 * degree] = color.r
        colorArray[3 * degree + 1] = color.g
        colorArray[3 * degree + 2] = color.b
        colorBuffer.set(colorArray)
        colorBuffer.needsUpdate = true
        polyGeometry.setAttribute("color", colorBuffer)
        degree++
      }
    })

    for (let k = degree; k < 7; k++) {
      sphereArray[k].visible = false
    }
    polyGeometry.setFromPoints(polygon.slice(0, degree))
  }

  return { filler, update }
}

const halfForward = new three.Vector3(0.5, 0.5, 0.5)

function colorFromPosition(position: three.Vector3) {
  let [x, y, z] = position.clone().add(halfForward).toArray()
  return new three.Color(z, 1 - x, y)
}
