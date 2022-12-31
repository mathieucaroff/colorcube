import * as three from "three"
import * as packageJson from "../package.json"
import { create } from "./lib/create"
import { githubCornerHTML } from "./lib/githubCorner"
import { createSliceableColorCube, UpdateCubeParam } from "./sliceableColorCube"
import { Color } from "three"
import { setupUserRotation, UserRotableOnRotateParam } from "./input/userRotation"
import { setupUserScrollLevel } from "./input/userScrollLevel"
import { clamp } from "./utils/clamp"
import GUI from "lil-gui"

function main() {
  let githubCornerDiv = create("div", { innerHTML: githubCornerHTML(packageJson.repository) })
  document.body.appendChild(githubCornerDiv)

  // three.js setup
  let state = {
    targetLevel: 0,
    animateCutDepth: true,
    animateCutAngle: true,
    cubeAutoRotation: true,
  }

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
    let leftClick = buttons & 1
    let middleClick = (buttons & 4) >> 2
    let updateCubeParameter: UpdateCubeParam = {}
    if (leftClick) {
      if (middleClick) {
        updateCubeParameter.cubeRotation = rotationMatrix
      } else {
        updateCubeParameter.cubeAndPlaneRotation = rotationMatrix
      }
    } else if (middleClick) {
      updateCubeParameter.planeRotation = rotationMatrix
    }
    updateCube(updateCubeParameter)
    render()
  }

  const smoothLevelChange = () => {
    if (state.animateCutDepth) {
      return
    }
    let { constant } = plane
    if (state.targetLevel) {
      if (constant !== state.targetLevel) {
        updateCube({
          planeConstant: clamp(state.targetLevel, constant - 0.01, constant + 0.01),
        })
        render()
        requestAnimationFrame(smoothLevelChange)
      }
    }
  }

  const handleLevelChange = (level: number) => {
    state.targetLevel = level
    smoothLevelChange()
  }

  // getting the color cube
  let { cube, filler, plane, updateCube } = createSliceableColorCube({})
  const helper = new three.PlaneHelper(plane, 1, 0xffffff)
  setupUserRotation({ onRotate: handleUserRotate })
  setupUserScrollLevel({ min: -1, max: 1, onLevelChange: handleLevelChange })
  scene.add(cube)
  scene.add(filler)
  scene.add(helper)
  helper.visible = false

  //
  updateCube({
    cubeAndPlaneRotation: new three.Matrix4().makeRotationFromEuler(new three.Euler(0, 0.8)),
  })

  let start = Date.now()
  const handleValueChange = () => {
    smoothLevelChange()
    auto()
    start = Date.now()
  }

  const gui = new GUI()
  gui.add(plane, "constant", -1, 1).name("cutLevel")
  gui.add(state, "animateCutDepth")
  gui.add(state, "animateCutAngle")
  gui.add(state, "cubeAutoRotation")
  gui.add(helper, "visible").name("showCuttingPlane")
  gui.onFinishChange(handleValueChange)

  const planeRotationMatrix = new three.Matrix4().makeRotationFromEuler(new three.Euler(0, -0.003))
  const fastRotationMatrix = new three.Matrix4().makeRotationFromEuler(new three.Euler(0, -0.009))
  const cubeRotationMatrix = new three.Matrix4().makeRotationFromEuler(new three.Euler(0, 0.003))
  const cameraDirection = new three.Vector3()
  const auto = () => {
    let needsRender = false
    if (state.animateCutDepth) {
      updateCube({
        planeConstant: Math.sin(Date.now() / 1000) * 0.8 + 0.1,
      })
      needsRender = true
    }
    if (state.animateCutAngle) {
      camera.getWorldDirection(cameraDirection)
      let speed = plane.normal.dot(cameraDirection) < 0
      let planeRotation = speed ? fastRotationMatrix : planeRotationMatrix
      updateCube({ planeRotation })
      needsRender = true
    }
    if (state.cubeAutoRotation) {
      updateCube({
        cubeRotation: cubeRotationMatrix,
      })
      needsRender = true
    }
    if (needsRender) {
      render()
    }

    requestAnimationFrame(auto)
  }

  handleResize()
  auto()
}

main()
