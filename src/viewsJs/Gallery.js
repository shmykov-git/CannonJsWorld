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
        url: "I'll be back.glb",
        scale: [0.13, 0.13, 0.13],
        position: [0, 0.8, 0],
        color: 0xff0000,            
    },
    {
        url: "f1.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
    },
    {
        url: "vually.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
    },
    {
        url: "BigDee.glb",
        scale: [0.15, 0.15, 0.15],
        position: [0, 1, 0],
        color: 0xff0000,            
    },
    {
        url: "CubeGalaxiesIntersection.glb",
        scale: [3, 3, 3],
        position: [0.2, -0.5, 0.8],
        color: 0xff0000,            
    },
    {
        url: "galaxy.glb",
        scale: [3.1, 3.1, 3.1],
        position: [0, -0.5, 0],
        color: 0xff0000,            
    },
    {
        url: "Chess.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "Fight.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        // color: 0xff0000,            
    },
    {
        url: "MobiusMaze.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "TheCat.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "gz.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "ussr.glb",
        scale: [2.2, 2.2, 2.2],
        position: [0, -0.3, 0],
        color: 0xff0000,            
    },
    {
        url: "bh&h.glb",
        scale: [2, 2, 2],
        position: [6, 0, 2],
        color: 0xff0000,            
    },
]

const positions = [...rCircle(models.length, 12).map(p => [p[0], 12, p[1]])]

const objects = models.map((model, i) => 
    new PSphere({
        ...baseArgs,
        position: positions[i], 
        model: {
            ...model,
            url: `gallery/${model.url}`
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
