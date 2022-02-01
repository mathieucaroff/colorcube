import * as THREE from 'THREE'

(window as any).t = THREE

let scaleOneVectorCoordinate = (baseVector: THREE.Vector3, coordinateName: 'x' | 'y' | 'z', axisLevel: number) => {
    let vector = baseVector.clone()
    vector[coordinateName] *= axisLevel
    return vector
}

let setColorPolygonGeometry = (vertexArray: THREE.Vector3[], vertexColorArray: THREE.Color[], geometry: THREE.BufferGeometry) => {
    // vector average
    let sum = new THREE.Vector3()
    vertexArray.forEach((vector) => { sum.add(vector) })
    let averageVector = sum.divideScalar(vertexArray.length).toArray()

    // color average
    let color = { r: 0, g: 0, b: 0 }
    vertexColorArray.forEach((c) => {
        color.r += c.r
        color.g += c.g
        color.b += c.b
    })
    let averageColor = [
        color.r / vertexArray.length,
        color.g / vertexArray.length,
        color.b / vertexArray.length,
    ]

    let positionArray: number[] = []
    let colorArray: number[] = []
    vertexArray.forEach((vector, k) => {
        let nextVector = vertexArray[(k + 1) % vertexArray.length]
        positionArray.push(...vector.toArray(), ...nextVector.toArray(), ...averageVector)
    })
    vertexColorArray.forEach((color, k) => {
        let nextColor = vertexColorArray[(k + 1) % vertexColorArray.length]
        colorArray.push(...color.toArray(), ...nextColor.toArray(), ...averageColor)
    })

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positionArray, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorArray, 3))
}

/**
 * createColorCube -- creates a clipped colorful cube and a filler triangle or hexagon
 *
 * @param cuttingLevel // [-1, 1] (N.B: 1, 1/3, -1/3, -1)
 * @returns a { cube, fillerMesh } object
 */
export let createColorCube = () => {
    // Note: the center of the cube is in (0, 0, 0)

    /// plane ///
    const cornerDistance = 3 ** 0.5 / 2
    let diagonalVector = new THREE.Vector3(0.5, -0.5, -0.5)
    let cuttingPlane = new THREE.Plane(diagonalVector.clone().normalize())

    let fillerMesh = new THREE.Mesh(
        new THREE.BufferGeometry(),
        new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })
    )

    let cubeGroup = new THREE.Group()

    // given the position of a vertex, compute the color associated to it
    let getVertexColor = (u: THREE.Vector3): THREE.Color => {
        let c = 0
        c += ((-u.x + 0.5) * 0xff << 8) // G
        c += ((u.y + 0.5) * 0xff) // R
        c += ((u.z + 0.5) * 0xff << 16) // B
        return new THREE.Color(c)
    }

    let setCuttingDirection = (x: number, y: number, z: number) => {
        if (Math.abs(x * y * z) !== 1) {
            throw new Error("direction coordinates must be 1 or -1")
        }
        diagonalVector.x = x / 2
        diagonalVector.y = y / 2
        diagonalVector.z = z / 2
        cuttingPlane.normal = diagonalVector.clone().normalize().applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(cubeGroup.rotation))
    }

    setCuttingDirection(1, -1, -1) // white to black

    let setCuttingLevel = (cuttingLevel: number) => {
        cuttingPlane.constant = cornerDistance * cuttingLevel

        let vertexArray: THREE.Vector3[]
        if (cuttingLevel < -1 || cuttingLevel > 1) {
            return
        } else if (-1 / 3 < cuttingLevel && cuttingLevel < 1 / 3) {
            // Hexagon
            let vector = diagonalVector.clone().multiplyScalar(-1)
            vertexArray = 'xy xz zx zy yz yx'.split(' ').map((pair) => {
                let [axisA, axisB] = pair as any
                let vectorA = scaleOneVectorCoordinate(vector, axisA, -1)
                let vectorB = scaleOneVectorCoordinate(vectorA, axisB, 4 * cuttingLevel * cornerDistance ** 2)
                return vectorB
            })
        } else {
            // Triangle
            let factor: number
            let vector: THREE.Vector3
            if (cuttingLevel < 0) {
                // // Triangle Bottom
                // level // [-1, -1/3]
                factor = (-cuttingLevel * 3 - 2) // [-1, 1]
                vector = diagonalVector
            } else {
                // // Triangle Top
                // level // [1/3, 1]
                factor = (cuttingLevel * 3 - 2) // [-1, 1]
                vector = diagonalVector.clone().multiplyScalar(-1)
            }
            vertexArray = [
                scaleOneVectorCoordinate(vector, 'x', factor),
                scaleOneVectorCoordinate(vector, 'y', factor),
                scaleOneVectorCoordinate(vector, 'z', factor),
            ]
        }

        let colorArray = vertexArray.map((vertex) => getVertexColor(vertex))
        setColorPolygonGeometry(vertexArray, colorArray, fillerMesh.geometry)
    }

    setCuttingLevel(0)

    /// cube ///
    let black = [0, 0, 0]
    let red = [1, 0, 0]
    let green = [0, 1, 0]
    let blue = [0, 0, 1]
    let cyan = [0, 1, 1]
    let magenta = [1, 0, 1]
    let yellow = [1, 1, 0]
    let white = [1, 1, 1]

    let cubeVertexToFaceVertexAndColorMap = {
        [0]: [[5, 10, 16], white],
        [1]: [[4, 8, 21], cyan],
        [2]: [[0, 11, 17], magenta],
        [3]: [[7, 12, 18], yellow],
        [4]: [[2, 13, 19], red],
        [5]: [[6, 14, 23], green],
        [6]: [[1, 9, 20], blue],
        [7]: [[3, 15, 22], black],
    }

    let faceVertexColorArray = new Array(24)

    Object.values(cubeVertexToFaceVertexAndColorMap).forEach(([[u, v, w], color]) => {
        faceVertexColorArray[u] = color
        faceVertexColorArray[v] = color
        faceVertexColorArray[w] = color
    })

    // flatten
    let colorBuffer = [].concat(...faceVertexColorArray)

    let cubeGeometry = new THREE.BoxGeometry(1, 1, 1)
    cubeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colorBuffer, 3))
    let cubeMaterial = new THREE.MeshBasicMaterial({
        vertexColors: true,
        clippingPlanes: [cuttingPlane],
    })
    let cube = new THREE.Mesh(cubeGeometry, cubeMaterial)

    cubeGroup.add(cube)
    cubeGroup.add(fillerMesh)

    let applyMatrix4 = (matrix: THREE.Matrix4) => {
        cubeGroup.applyMatrix4(matrix)
        cuttingPlane.applyMatrix4(matrix)
    }
    let applyXYRotation = (x: number, y: number) => {
        applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(x, y)))
    }

    return { cubeGroup, setCuttingLevel, setCuttingDirection, applyXYRotation }
}
