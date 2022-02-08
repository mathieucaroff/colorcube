import * as THREE from "three"
import { createColorCube } from "./colorcube"
import * as packageJson from "../package.json"
import { githubCornerHTML } from "./lib/githubCorner"
import { h } from "./lib/hyper"
import { CubeCornerSelector } from "./gui/gui"

type TTT<TX> = [TX, TX, TX]

let clamp = (value: number, lower: number, upper: number) => {
    return Math.max(Math.min(value, upper), lower)
}

export let main = async () => {
    let githubCornerDiv = h("div", { innerHTML: githubCornerHTML(packageJson.repository) })
    document.body.appendChild(githubCornerDiv)

    let topleft = h("div", { className: "top-left-corner frame" })
    document.body.appendChild(topleft)

    let eightCornerArray = Array.from({ length: 8 }, (_, k): TTT<number> => {
        return [((k & 4) >> 1) - 1, (k & 2) - 1, ((k & 1) << 1) - 1]
    })
    let corner = eightCornerArray[7]

    // cube cutting level
    let level = -1
    let levelGoal = 0.96

    let colorNameArray = ["white", "cyan", "magenta", "yellow", "red", "green", "blue", "black"]
    let colorValueArray = "#FFFFFF #00FFFF #FF00FF #FFFF00 #FF0000 #00FF00 #0000FF #000000".split(
        " ",
    )
    let colorNumberArray = [3, 2, 7, 1, 5, 0, 6, 4]
    let selector: HTMLDivElement
    let currentCorner = 2

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
        selector = CubeCornerSelector({
            setCorner,
            colorNameArray,
            colorValueArray,
            currentCorner,
            levelGoal,
            updateLevelGoal,
        })
        topleft.appendChild(selector)
    }
    setCorner(colorNumberArray[1])

    // notification
    let notification = h("p", {
        innerHTML:
            "<ul><li><b>Click and Drag</b> to rotate the cube <li><b>Scroll</b> to change the cut level</ul>",
    })
    notification.style.padding = "25px 0px"
    notification.style.color = "white"

    let notificationBox = h("div", {}, [notification])
    notificationBox.style.width = "300px"
    notificationBox.style.height = "100px"
    notificationBox.style.backgroundColor = "black"
    notificationBox.style.margin = "20% auto"
    document.addEventListener("mousedown", (ev) => {
        ev.preventDefault()
        ev.stopImmediatePropagation()
        notificationOverlay.style.display = "none"
    })

    let notificationOverlay = h("div", { className: "overlay" }, [notificationBox])
    document.body.appendChild(notificationOverlay)

    // THREE
    let scene = new THREE.Scene()
    let camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000)

    let renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.localClippingEnabled = true
    document.body.appendChild(renderer.domElement)

    let cubeObject = createColorCube()
    cubeObject.applyXYRotation(Math.PI / 12, (2.5 * Math.PI) / 6)
    scene.add(cubeObject.cubeGroup)
    camera.position.z = 5

    // dragging and rotation
    let isDragging = false
    let previousMousePosition = { y: 0, x: 0 }
    renderer.domElement.addEventListener("mousedown", () => {
        isDragging = true
    })
    renderer.domElement.addEventListener("mousemove", (e) => {
        if (isDragging) {
            cubeObject.applyXYRotation(
                (e.offsetY - previousMousePosition.y) * 0.006,
                (e.offsetX - previousMousePosition.x) * 0.006,
            )
        }
        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY,
        }
    })
    document.addEventListener("mouseup", () => {
        isDragging = false
    })

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
