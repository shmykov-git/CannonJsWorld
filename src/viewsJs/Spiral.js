import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {PWorld, PSphere, PJumpSphere, PPolyhedron, PBox } from '../PWorld/PObjects.js'
import { getDiceCubeMaterial, getEarthMaterial, getMeshTransparentMaterial03 } from '../PWorld/Scene/MeshMaterials.js'
import { BoxComposer } from '../PWorld/Tools/Composer.js';
import { rand } from 'three/tsl';
import { spiralData } from '../PWorld/data.js'

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
    worldRadius: 50,
    orbitControlDistance: [1, 100]
});

// one body - one mesh
const objects = [
    new PPolyhedron({
        color: 0x0000ff,
        // usePhysic: false,
        scale: [2, 2, 2],
        position: [0, 2, 0],
        // meshMaterialFn: getMeshWireMaterial,
        ...spiralData
    }),

    new PSphere({ 
        id: "earth",
        radius: 1.5,
        position: [6.8, 18.5, 8], 
        color: 0xdddddd,
        meshMaterialFn: getEarthMaterial
    }), 
];

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
