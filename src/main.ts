import * as THREE from 'THREE'
import { createColorCube } from './colorcube'

type TTT<TX> = [TX, TX, TX]

export let main = async () => {
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

    let last_occurence = 0
    let render = () => {
        let theta = Date.now() / 1000
        let occurence = Math.floor((theta / Math.PI + 1) / 2)
        let level = Math.cos(theta)

        if (occurence > last_occurence) {
            last_occurence = occurence
            let corner = eightCornerArray[Math.floor(Math.random() * 8)]
            console.log("corner", ...corner)
            cubeObject.setCuttingDirection(...corner)
        }
        cubeObject.setCuttingLevel(level)
        renderer.render(scene, camera)

        requestAnimationFrame(render)
    }

    render()
}
