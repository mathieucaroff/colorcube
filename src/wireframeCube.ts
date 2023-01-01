import { three } from "./alias"

export function createWireframeCube() {
  let boxGeometry = new three.BoxGeometry()
  let wireframe = new three.WireframeGeometry(boxGeometry)
  let wireframeCube = new three.LineSegments(wireframe)
  return { wireframeCube }
}
