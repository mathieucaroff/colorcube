import * as three from "three"
import { createColorCube } from "./colorcube"
import * as packageJson from "../package.json"
import { githubCornerHTML } from "./lib/githubCorner"
import { h } from "./lib/hyper"
import { CubeCornerSelector } from "./gui/gui"
import React from "react"
import ReactDOM from "react-dom"

type TTT<TX> = [TX, TX, TX]

let clamp = (value: number, lower: number, upper: number) => {
  return Math.max(Math.min(value, upper), lower)
}

type DesktopOrMobile = "desktop" | "mobile"

/**
 *
 * @param userAgent the user agent of the navigator
 * @returns true when the userAgent corresponds to that of a mobile
 */
export function getDesktopOrMobile(userAgent: string): DesktopOrMobile {
  return userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)
    ? "mobile"
    : "desktop"
}

export let main = async () => {
  let githubCornerDiv = h("div", { innerHTML: githubCornerHTML(packageJson.repository) })
  document.body.appendChild(githubCornerDiv)

  let topleft = h("div", { className: "top-left-corner frame" })
  document.body.appendChild(topleft)

  let eightCornerArray = Array.from({ length: 8 }, (_, k): TTT<number> => {
    return [((k & 4) >> 1) - 1, (k & 2) - 1, ((k & 1) << 1) - 1]
  }).reverse()
  let corner = eightCornerArray[0]

  // cube cutting level
  let level = -1
  let levelGoal = 0.8

  let colorNameArray = ["white", "cyan", "magenta", "yellow", "red", "green", "blue", "black"]
  let colorValueArray = "#FFFFFF #00FFFF #FF00FF #FFFF00 #FF0000 #00FF00 #7777FF #000000".split(" ")
  let colorNumberArray = [3, 2, 7, 1, 5, 0, 6, 4]
  let selector: HTMLDivElement
  let currentCorner = 0

  let updateLevelGoal = (value: number) => {
    levelGoal = value
    setCorner(currentCorner)
  }

  let setCorner = (n: number) => {
    currentCorner = n
    if (selector) {
      selector.remove()
    }
    corner = eightCornerArray[colorNumberArray[currentCorner]]
    ReactDOM.render(
      React.createElement(CubeCornerSelector, {
        setCorner,
        colorNameArray,
        colorValueArray,
        currentCorner,
        levelGoal,
        updateLevelGoal,
      }),
      topleft,
    )
  }
  setCorner(0)

  // notification
  let notification = h("p", {
    innerHTML:
      "<ul><li><b>Click and Drag</b> to rotate the cube <li><b>Scroll</b> to change the cut level</ul>",
  })
  notification.style.padding = "25px 0px"
  notification.style.color = "white"

  let notificationBox = h("div", {}, [notification])
  notificationBox.style.width = "400px"
  notificationBox.style.height = "100px"
  notificationBox.style.backgroundColor = "#222"
  notificationBox.style.border = "5px solid #888"
  notificationBox.style.margin = "20% auto"
  document.addEventListener("mousedown", () => {
    notificationOverlay.style.display = "none"
  })
  document.addEventListener("touchstart", () => {
    notificationOverlay.style.display = "none"
  })

  let notificationOverlay = h("div", { className: "overlay" }, [notificationBox])
  document.body.appendChild(notificationOverlay)

  // three
  let scene = new three.Scene()
  let isMobile = getDesktopOrMobile(navigator.userAgent) === "mobile"
  isMobile = false
  let canvasWidth = isMobile ? window.outerWidth : window.innerWidth
  let canvasHeight = Math.min(isMobile ? window.outerHeight : window.innerHeight, canvasWidth)
  let camera = new three.PerspectiveCamera(30, canvasWidth / canvasHeight, 0.1, 1000)

  let renderer = new three.WebGLRenderer()
  renderer.setSize(canvasWidth, canvasHeight)
  renderer.localClippingEnabled = true
  document.body.appendChild(renderer.domElement)

  let cubeObject = createColorCube()
  cubeObject.applyXYRotation(Math.PI / 12, Math.PI / 6)
  scene.add(cubeObject.cubeGroup)
  camera.position.z = 5

  // dragging and rotation
  let isDragging = false
  let lastPosition = { y: 0, x: 0 }
  let lastTouchPosition = { y: 0, x: 0 }
  function handleStart(x: number, y: number) {
    isDragging = true
    lastPosition = { x, y }
    lastTouchPosition = { x, y }
  }

  function handleMove(x: number, y: number) {
    if (isDragging) {
      cubeObject.applyXYRotation((y - lastPosition.y) * 0.006, (x - lastPosition.x) * 0.006)
    }
    lastPosition = { x, y }
  }

  function handleEnd() {
    isDragging = false
  }

  let { documentElement } = document

  documentElement.addEventListener("mousedown", (ev) => {
    handleStart(ev.clientX, ev.clientY)
  })
  documentElement.addEventListener("touchstart", (ev) => {
    ev.preventDefault()
    ev.stopImmediatePropagation()
    let x = ev.touches[0].clientX
    let y = ev.touches[0].clientY
    handleStart(x, y)
  })
  documentElement.addEventListener("mousemove", (ev) => {
    handleMove(ev.clientX, ev.clientY)
  })
  documentElement.addEventListener("touchmove", (ev) => {
    let x = ev.touches[0].clientX
    let y = ev.touches[0].clientY
    handleMove(x, y)
  })
  document.addEventListener("mouseup", handleEnd)
  document.addEventListener("touchend", handleEnd)
  document.addEventListener("touchcancel", handleEnd)

  // render cube
  let render = () => {
    cubeObject.setCuttingDirection(...corner)
    cubeObject.setCuttingLevel(level)
    renderer.render(scene, camera)
    level = clamp(level + clamp(levelGoal - level, -0.03, 0.03), -1, 1)
    requestAnimationFrame(render)
  }
  render()

  /* wheel */
  document.addEventListener(
    "wheel",
    (ev) => {
      notificationOverlay.style.display = "none"
      ev.preventDefault()
      levelGoal = clamp(level + clamp(-ev.deltaY * 0.002, -0.166, 0.166), -1, 1)
      setCorner(currentCorner)
    },
    true,
  )
}
