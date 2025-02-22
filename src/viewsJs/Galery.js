import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {PWorld, PSphere, PJumpSphere, PPolyhedron, PBox } from '../PWorld/PObjects.js'
import { getDiceCubeMaterial, getEarthMaterial, getMeshTransparentMaterial, getMeshTransparentMaterial45 } from '../PWorld/Scene/MeshMaterials.js'
import { BoxComposer } from '../PWorld/Tools/Composer.js';
import { color, rand } from 'three/tsl';
import { rCircle } from '../PWorld/VecFuncs.js'

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 5)
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5)
directionalLight.position.set(1, 2, 3)

const world = new PWorld({
    useGround: true,
    ground: {
        type: "cylinder",
        size: [15, 15, 0.5, 200],
        color: 0x00aa00,
        meshMaterialFn: getMeshTransparentMaterial45
    },
    orbitControlDistance: [0.01, 100],
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
        url: "w30.glb",
        scale: [2, 2, 5],
        position: [0, -1, 0],
        color: 0xff0000,            
    },
    {
        url: "f1.glb",
        scale: [1, 1, 1],
        position: [0, 0, 0],
    },
    {
        url: "vually.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
    },
    {
        url: "c13.glb",
        scale: [2, 2, 2],
        position: [0, -1, 0],
        color: 0xff0000,            
    },
    {
        url: "c14.glb",
        scale: [2, 2, 2],
        position: [0, -1, 0],
        color: 0xff0000,            
    },
    {
        url: "d14.glb",
        scale: [2, 2, 2],
        position: [0, -1, 0],
        color: 0xff0000,            
    },
    {
        url: "dragon.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "KungFuR.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        // color: 0xff0000,            
    },
    {
        url: "nbs.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "scorpio.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "w29.glb",
        scale: [2, 2, 2],
        position: [0, -1, 0],
        color: 0xff0000,            
    },
]

const positions = [...rCircle(models.length, 10).map(p => [p[0], 10, p[1]])]

const objects = models.map((model, i) => 
    new PSphere({
        ...baseArgs,
        position: positions[i], 
        model: model
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
        distance: [10, 100],
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
