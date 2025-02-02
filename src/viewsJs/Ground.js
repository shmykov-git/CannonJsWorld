import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {PWorld, PSphere, PJumpSphere, PPolyhedron, PBox } from '../PWorld/PObjects.js'
import { getDiceCubeMaterial, getEarthMaterial, getMeshTransparentMaterial } from '../PWorld/Scene/MeshMaterials.js'
import { BoxComposer } from '../PWorld/Tools/Composer.js';
import { rand } from 'three/tsl';

const world = new PWorld({
    useGround: true,
});

// one body - one mesh
const objects = [
    // new PPolyhedron({
    //     color: 0x0000ff,
    //     // usePhysic: false,
    //     scale: [2, 2, 2],
    //     position: [0, 2, 0],
    //     // meshMaterialFn: getMeshWireMaterial,
    //     ...data
    // }),

    new PSphere({ 
        id: "earth",
        radius: 1.5,
        position: [6.8, 18.5, 8], 
        color: 0xdddddd,
        meshMaterialFn: getEarthMaterial
    }), 
];

world.init(objects);
world.attachCamera("earth", {
    distance: [10, 30],
    strategy: "DistanceFollowing"
})

document.getElementById("btnBum").addEventListener("click", event => { 
    world.get("earth").body.applyForce(new CANNON.Vec3(0, 10000*Math.random(), 0))
});

// Animation loop
function animate() {
    world.update();
    requestAnimationFrame(animate);
}

animate();
