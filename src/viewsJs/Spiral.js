import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {PWorld, PSphere, PJumpSphere, PPolyhedron, PBox } from '../PWorld/PObjects.js'
import { getDiceCubeMaterial, getEarthMaterial, getMeshTransparentMaterial03, getMeshTransparentMaterial } from '../PWorld/Scene/MeshMaterials.js'
import { BoxComposer } from '../PWorld/Tools/Composer.js';
import { rand } from 'three/tsl';
import { spiralData, shellData, diniData } from '../PWorld/data.js'

const world = new PWorld({
    cameraPosition: [30, 30, 30],
    gravity: [0, -30, 0],
    useGround: true,
    ground: {
        size: [25, 25],
        color: 0x00AA00,
        type: "mandelbrot",
        meshMaterialFn: getMeshTransparentMaterial03
    },
    useWorldRadius: true,    
    worldRadius: 30,
    orbitControlDistance: [1, 100]
});

const q = new CANNON.Quaternion()
q.setFromEuler(Math.PI/3, 0, 0);

// one body - one mesh
const objects = [
    new PPolyhedron({
        id: "spiral",
        color: 0x0000ff,
        // usePhysic: false,
        scale: [2, 2, 2],
        position: [0, 2, 0],
        // meshMaterialFn: getMeshWireMaterial,
        ...spiralData
    }),

    new PPolyhedron({
        id: "shell",
        color: 0x0000ff,
        usePhysic: false,
        scale: [13, 13, 13],
        position: [0, 0.35*13, -25],
        quaternion: q,
        meshMaterialFn: getMeshTransparentMaterial,
        ...shellData
    }),

    new PPolyhedron({
        id: "flower",
        color: 0x0000ff,
        usePhysic: false,
        scale: [25, 25, 25],
        position: [-24.5, 0.45*25, 2.5],
        meshMaterialFn: getMeshTransparentMaterial,
        ...diniData
    }),

    new PSphere({ 
        id: "earth",
        radius: 1.5,
        position: [6.8, 18.5, 8], 
        color: 0xdddddd,
        meshMaterialFn: getEarthMaterial
    }), 

    new PBox({
        id: "linkToAlgo",
        color: 0x333333,
        meshMaterialFn: getMeshTransparentMaterial,
        useView: true,
        useModel: true,
        useSelection: true,
        selection: {
            onSelect: o => copyLink(o, "https://github.com/shmykov-git/Algo")
        },        
        size: [10, 2, 1],
        position: [-9, 1, 14], 
        model: {
            url: 'text/linkToAlgo.glb',
            scale: [5, 5, 5],
            position: [0, 0, 0],        
        }
    }), 

    new PBox({
        id: "linkToProject",
        color: 0x333333,
        meshMaterialFn: getMeshTransparentMaterial,
        useView: true,
        useModel: true,
        useSelection: true,
        selection: {
            onSelect: o => copyLink(o, "https://github.com/shmykov-git/CannonJsWorld")
        },        
        size: [10, 2, 1],
        position: [9, 1, 14], 
        model: {
            url: 'text/linkToProject.glb',
            scale: [6.7, 6.7, 6.7],
            position: [0, 0, 0],        
        }
    })
];

function copyLink(obj, link) {
    obj.body.applyForce(new CANNON.Vec3(0, 1000, -10000))
    
    navigator.clipboard.writeText(link)
        .then(() => console.log(link))
        .catch(err => console.error(err));
}

world.init(objects);

document.getElementById("btnBum").addEventListener("click", event => { 
    world.get("earth").body.applyForce(new CANNON.Vec3(0, 10000*Math.random(), 0))
});

// Animation loop
function animate() {
    world.update();
    requestAnimationFrame(animate);
}

animate();
