import * as three from "three"
import * as packageJson from "../package.json"
import { create } from "./lib/create"
import { githubCornerHTML } from "./lib/githubCorner"
import { createSliceableColorCube } from "./sliceableColorCube"
import { Color } from "three"
import { createUserRotatable } from "./userRotatable"

function main() {
  let githubCornerDiv = create("div", { innerHTML: githubCornerHTML(packageJson.repository) })
  document.body.appendChild(githubCornerDiv)

  // three.js setup
  let scene = new three.Scene()
  scene.background = new Color(0x404040)
  let camera = new three.PerspectiveCamera(30, window.innerWidth / window.innerHeight)
  camera.near = 0.1
  camera.far = 1000
  camera.position.z = 5
  let renderer = new three.WebGLRenderer()
  renderer.localClippingEnabled = true

  document.body.appendChild(renderer.domElement)

  const render = () => {
    renderer.render(scene, camera)
  }

  const handleResize = () => {
    let w = window.innerWidth
    let h = window.innerHeight
    camera.aspect = w / h
    camera.setFocalLength(90 * (Math.min(w, h) / Math.max(w, h)))
    renderer.setSize(w, h)
    render()
  }
  window.addEventListener("resize", handleResize)

  // getting the color cube
  let rotatable = createUserRotatable({ onRotate: render })
  rotatable.add(createSliceableColorCube({}))
  scene.add(rotatable)

  handleResize()
}

main()
