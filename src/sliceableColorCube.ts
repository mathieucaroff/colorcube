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
  let sphereArray: three.Mesh[] = []
  let polygon = Array.from({ length: 7 }, () => {
    let s = new three.SphereGeometry(0.02)
    let ma = new three.MeshBasicMaterial({ color: "blue" })
    let me = new three.Mesh(s, ma)
    sphereArray.push(me)
    filler.add(me)
    return me.position
  })

  let fillerMesh = new three.Mesh(
    new three.PolyhedronBufferGeometry(
      ([] as number[]).concat(...polygon.map((x) => x.toArray())),
      [0, 1, 2, 0, 1, 3],
      0.1,
    ),
    new three.MeshBasicMaterial({ vertexColors: true, side: three.DoubleSide }),
  )

  const update = (boxMatrix: three.Matrix4, plane: three.Plane) => {
    let degree = 0
    unitBoxEdgeVertices.forEach(([a, b], k) => {
      line.start.copy(a).multiplyScalar(0.5)
      line.end.copy(b).multiplyScalar(0.5)
      line.applyMatrix4(boxMatrix)
      let intersection = plane.intersectLine(line, polygon[degree])
      if (intersection !== null) {
        sphereArray[degree].visible = true
        degree++
      }
    })

    for (let k = degree; k < 7; k++) {
      sphereArray[k].visible = false
    }

    let positionArray: number[] = []
    let colorArray: number[] = [0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000, 0xff0000]

    fillerMesh.geometry.setAttribute("position", new three.Float32BufferAttribute(positionArray, 3))
    fillerMesh.geometry.setAttribute("color", new three.Float32BufferAttribute(colorArray, 3))
  }

  return { filler, update }
}
