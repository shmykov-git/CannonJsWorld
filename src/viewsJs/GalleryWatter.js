import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {PWorld, PSphere, PJumpSphere, PPolyhedron, PBox } from '../PWorld/PObjects.js'
import { getDiceCubeMaterial, getEarthMaterial, getMeshTransparentMaterial, getMeshTransparentMaterial45 } from '../PWorld/Scene/MeshMaterials.js'
import { BoxComposer } from '../PWorld/Tools/Composer.js';
import { color, rand } from 'three/tsl';
import { rCircleFi, rotateY } from '../PWorld/VecFuncs.js'

const fallY = 8
const itemRadius = 8
const worldRadius = 10
const worldCamera = [10, 50]
const cameraPosition = [5, 10, 15]

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 5)
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5)
directionalLight.position.set(1, 2, 3)

const world = new PWorld({
    cameraPosition: cameraPosition,
    useGround: true,
    ground: {
        type: "cylinder",
        size: [worldRadius, worldRadius, 0.5, 200],
        color: 0x00aa00,
        meshMaterialFn: getMeshTransparentMaterial45
    },
    orbitControlDistance: [0.01, worldRadius * 8],
    lights: [ambientLight, directionalLight]
});


const baseArgs = { 
    radius: 1.5,
    color: 0x333333,
    meshMaterialFn: getMeshTransparentMaterial,
    useView: true,
    useModel: true,
    geometry: {
        type: 'icosahedron',
        detail: 6
    },
    useSelection: true,
    selection: {
        onSelect: objectSelected
    }
}

const models = [
    {
        url: "watter/w1.glb",
        scale: [2, 2, 2],
        position: [0, -0.9, 0]
    },
    {
        url: "watter/w2.glb",
        scale: [2, 2, 2],
        position: [0, -0.9, 0]
    },
    {
        url: "watter/w3.glb",
        scale: [2, 2, 2],
        position: [0, -0.9, 0]
    },
    {
        url: "watter/w4.glb",
        scale: [2, 2, 2],
        position: [0, -0.9, 0]
    },
    {
        url: "watter/w5.glb",
        scale: [2, 2, 2],
        position: [0, -0.9, 0]
    },
    {
        url: "watter/w6.glb",
        scale: [2, 2, 2],
        position: [0, -0.9, 0]
    },
]

const positions = [...rCircleFi(models.length, itemRadius).map(p => [[p[0], fallY, p[1]], rotateY(p[2])])]

const objects = models.map((model, i) => 
    new PSphere({
        ...baseArgs,
        position: positions[i][0], 
        quaternion: positions[i][1],
        model: {
            ...model,
            url: model.url
        }
    })
)

world.init(objects);


function objectSelected(obj) {
    if (world.attachArgs && world.attachArgs.object)
        world.attachArgs.object.showView()

    obj.hideView()

    world.attachCamera({
        object: obj,
        distance: [0.01, 3],
        acceleration: 0.03,
        strategy: "DistanceFollowing"
    })
}

document.getElementById("btnDetach").addEventListener("click", event => { 
    if (world.attachArgs && world.attachArgs.object)
        world.attachArgs.object.showView()

    world.attachCamera({
        targetPositionFn: () => new THREE.Vector3(0, 0, 0),
        distance: worldCamera,
        acceleration: 0.005,
        strategy: "DistanceFollowing"
    })
});


// Animation loop
function animate() {
    world.update();
    requestAnimationFrame(animate);
}

animate();
