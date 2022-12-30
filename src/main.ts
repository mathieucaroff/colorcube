import * as three from "three"
import * as packageJson from "../package.json"
import { create } from "./lib/create"
import { githubCornerHTML } from "./lib/githubCorner"
import { createSliceableColorCube } from "./sliceableColorCube"
import { Color } from "three"
import { setupUserRotation, UserRotableOnRotateParam } from "./input/userRotation"
import { setupUserScrollLevel } from "./input/userScrollLevel"
import { clamp } from "./utils/clamp"

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

  const handleUserRotate = (param: UserRotableOnRotateParam) => {
    let { rotationMatrix, buttons } = param
    console.log("buttons", buttons)
    if (buttons & 1) {
      cube.applyMatrix4(rotationMatrix)
    }
    if (buttons & 4) {
      plane.applyMatrix4(rotationMatrix)
    }
    render()
  }

  let targetLevel = 0
  const smoothLevelChange = () => {
    let { constant } = plane
    if (constant !== targetLevel) {
      plane.constant = clamp(targetLevel, constant - 0.01, constant + 0.01)
      render()
      requestAnimationFrame(smoothLevelChange)
    }
  }

  const handleLevelChange = (level: number) => {
    targetLevel = level
    smoothLevelChange()
  }

  // getting the color cube
  let { cube, plane } = createSliceableColorCube({})
  setupUserRotation({ onRotate: handleUserRotate })
  setupUserScrollLevel({ min: -1, max: 1, onLevelChange: handleLevelChange })
  scene.add(cube)

  handleResize()
}

main()
