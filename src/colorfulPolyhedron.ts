import { lodash, three } from "./alias"

export function createColorfulPolyhedron(maxVertexCount: number) {
  let faceCount = (maxVertexCount * (maxVertexCount - 1) * (maxVertexCount - 2)) / 6
  // A face is has 3 vertices. Each vertex is made up of 3 coordinates, hence 3 * 3
  let vertexList = Array.from({ length: faceCount * 3 * 3 }, () => 1)
  // A face is has 3 vertices. Each color is made up of 3 channels, hence 3 * 3
  let colorList = Array.from({ length: faceCount * 3 * 3 }, () => 0.5)

  let vertexBuffer = new three.Float32BufferAttribute(vertexList, 3)
  let colorBuffer = new three.Float32BufferAttribute(colorList, 3)

  let geometry = new three.BufferGeometry()
  let material = new three.MeshBasicMaterial({
    vertexColors: true,
    side: three.DoubleSide,
  })
  let polyhedron = new three.Mesh(geometry, material)

  const updatePolyhedron = (colorArray: three.Color[], vertexArray: three.Vector3[]) => {
    colorList = []
    vertexList = []
    let iterCount = 0
    for (let k = 0; k < vertexArray.length; k++) {
      for (let m = 0; m < k; m++) {
        for (let n = 0; n < m; n++) {
          vertexList.push(
            ...vertexArray[k].toArray(),
            ...vertexArray[m].toArray(),
            ...vertexArray[n].toArray(),
          )
          colorList.push(
            ...colorArray[k].toArray(),
            ...colorArray[m].toArray(),
            ...colorArray[n].toArray(),
          )
          iterCount++
        }
      }
    }
    for (; iterCount < faceCount; iterCount++) {
      vertexList.push(0, 0, 0, 0, 0, 0, 0, 0, 0)
      colorList.push(0, 0, 0, 0, 0, 0, 0, 0, 0)
    }
    vertexBuffer.set(vertexList)
    vertexBuffer.needsUpdate = true
    colorBuffer.set(colorList)
    colorBuffer.needsUpdate = true
    geometry.setAttribute("position", vertexBuffer)
    geometry.setAttribute("color", colorBuffer)
  }

  return {
    polyhedron,
    updatePolyhedron,
  }
}
