import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {PWorld, PSphere, PJumpSphere, PPolyhedron, PBox } from '../PWorld/PObjects.js'
import { getDiceCubeMaterial, getEarthMaterial, getMeshTransparentMaterial, getMeshTransparentMaterial45, getMeshItemMaterial } from '../PWorld/Scene/MeshMaterials.js'
import { BoxComposer } from '../PWorld/Tools/Composer.js';
import { color, rand } from 'three/tsl';
import { rCircle } from '../PWorld/VecFuncs.js'
import { coodsWithText } from '../PWorld/data.js';

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 5)
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5)
directionalLight.position.set(1, 2, 3)

const world = new PWorld({
    useGround: true,
    worldRadius: 50,
    ground: {
        type: "cylinder",
        size: [25, 25, 0.5, 200],
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
        url: "tattoos/b10.glb",
        scale: [2, 2, 2],
        position: [0, 0, -1],
        color: 0xff0000,            
    },
    {
        url: "tattoos/b5.glb",
        scale: [2, 2, 2],
        position: [2, -0.5, 0],
    },
    {
        url: "tattoos/b6.glb",
        scale: [2, 2, 2],
        position: [0, 1.5, -0.5],
    },
    {
        url: "tattoos/b9.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/bb2.glb",
        scale: [2, 2, 2],
        position: [0, -0.5, -0.8],
        color: 0xff0000,            
    },
    {
        url: "tattoos/bb3.glb",
        scale: [3, 3, 3],
        position: [0, -0.5, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/bc1.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/c3.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/d5.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/e3.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/ee1.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/h1.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/lh1.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/m8.glb",
        scale: [2.7, 2.7, 2.7],
        position: [0, -1, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/md1.glb",
        scale: [2, 2, 2],
        position: [0.5, 0, 0.5],
        color: 0xff0000,            
    },
    {
        url: "tattoos/mm1.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/o2.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/p3.glb",
        scale: [2, 2, 2],
        position: [0, -2, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/tb1.glb",
        scale: [2, 2, 2],
        position: [-1, -1, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/w17+.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/w18+.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/w19.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/wl1.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/wp1.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
    {
        url: "tattoos/ww1.glb",
        scale: [2, 2, 2],
        position: [0, 0, 0],
        color: 0xff0000,            
    },
]

const fallY = 8
const itemRadius = 22
const positions = [...rCircle(models.length, itemRadius).map(p => [p[0], fallY, p[1]])]

const objects = models.map((model, i) => 
    new PSphere({
        ...baseArgs,
        position: positions[i], 
        model: {
            ...model,
            url: model.url
        }
    })
)

world.init(
    [
        ...objects,
        // new PPolyhedron({
        //     id: "coods",
        //     color: 0x984523,
        //     usePhysic: false,
        //     scale: [20, 20, 20],
        //     position: [0, 0, 0],
        //     meshMaterialFn: getMeshItemMaterial,
        //     ...coodsWithText
        // })
    ]);


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
