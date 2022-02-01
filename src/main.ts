import * as THREE from 'three'
import { createColorCube } from './colorcube'
import * as packageJson from '../package.json'
import { githubCornerHTML } from './lib/githubCorner'
import { h } from './lib/hyper'
import { cubeCornerSelector } from './gui/gui'

type TTT<TX> = [TX, TX, TX]

let clamp = (value: number, lower: number, upper: number) => {
    return Math.max(Math.min(value, upper), lower)
}

export let main = async () => {
    document.body.appendChild(h("div", { innerHTML: githubCornerHTML(packageJson.repository) }))

    let colorNameArray = ["white", "cyan", "magenta", "yellow", "red", "green", "blue", "black"]
    let colorNumberArray = [3, 2, 7, 1, 5, 0, 6, 4]
    let select = (n: number) => { corner = eightCornerArray[n] }
    let selector = cubeCornerSelector({ select, colorNameArray, colorNumberArray })
    let topleft = h("div", { className: "top-left-corner frame" }, [selector])
    document.body.appendChild(topleft)

    let notification = h("p", { innerHTML: "<b>Click and Drag</b> to rotate the cube <b>Scroll</b> to change the cut level" })
    notification.style.textAlign = "center"
    notification.style.padding = "55px 20px"

    let notificationBox = h("div", {}, [notification])
    notificationBox.style.width = "300px"
    notificationBox.style.height = "150px"
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
    cubeObject.applyXYRotation(Math.PI / 12, 2.5 * Math.PI / 6)
    scene.add(cubeObject.cubeGroup)
    camera.position.z = 5

    // dragging and rotation
    let isDragging = false
    let previousMousePosition = { y: 0, x: 0 }
    renderer.domElement.addEventListener('mousedown', () => {
        isDragging = true
    })
    renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
            cubeObject.applyXYRotation(
                (e.offsetY - previousMousePosition.y) * 0.006,
                (e.offsetX - previousMousePosition.x) * 0.006,
            )
        }
        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        }
    })
    document.addEventListener('mouseup', () => {
        isDragging = false
    })

    let eightCornerArray = Array.from({ length: 8 }, (_, k): TTT<number> => {
        return [((k & 4) >> 1) - 1, (k & 2) - 1, ((k & 1) << 1) - 1]
    })

    let level = -1
    let levelGoal = 0.96
    let corner = eightCornerArray[7]
    let render = () => {
        cubeObject.setCuttingDirection(...corner)
        cubeObject.setCuttingLevel(level)
        renderer.render(scene, camera)
        level = clamp(level + clamp(levelGoal - level, -0.03, 0.03), -1, 1)
        requestAnimationFrame(render)
    }
    render()

    /* wheel */
    document.addEventListener('wheel', (ev) => {
        notificationOverlay.style.display = "none"
        ev.preventDefault()
        levelGoal = clamp(level + clamp(ev.deltaY * 0.002, -0.166, 0.166), -1, 1)
    }, true)
}
