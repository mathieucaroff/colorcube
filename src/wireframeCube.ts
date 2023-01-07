import { three } from "./alias"

export interface WireframeCubeParam {
  size: number
}

export function createWireframeCube({ size }: WireframeCubeParam) {
  let boxGeometry = new three.BoxGeometry(size, size, size)
  let wireframe = new three.WireframeGeometry(boxGeometry)
  let wireframeCube = new three.LineSegments(wireframe)
  return { wireframeCube }
}
