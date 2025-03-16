import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {PWorld, PSphere, PJumpSphere, PPolyhedron, PBox } from '../PWorld/PObjects.js'
import { getMeshTransparentMaterial03, getDiceCubeMaterial, getEarthMaterial, getMeshWireMaterial, getMeshItemMaterial } from '../PWorld/Scene/MeshMaterials.js'
import { pStoneMaterial, pPlasticMaterial } from '../PWorld/World/PhysicMaterials.js'
import { BoxComposer } from '../PWorld/Tools/Composer.js';
import { pyramid1000 } from '../PWorld/composeData.js'
import { rand } from 'three/tsl';
import { coodsWithText } from '../PWorld/data.js';


const world = new PWorld({
    cameraPosition: [8, 10, 25],
    gravity: [0, -10, 0],
    useGround: true,
    ground: {
        size: [40, 40, 0.5],
        color: 0x22ff44,
        type: "box",
        meshMaterialFn: getMeshTransparentMaterial03
    },
    useWorldRadius: true,    
    worldRadius: 20,
    orbitControlDistance: [1, 100]
});

const k = 1
const boxComposer = new BoxComposer({
    position: [0, k/2, 0],
    scale: [k, k, k],
    boxScale: [1, 1, 1],
    color: 0x0000ff,
    boxMass: 1,
    pMaterial: pStoneMaterial,
    ...pyramid1000
})

// one body - one mesh
const objects = [
    new PPolyhedron({
        id: "coods",
        color: 0x984523,
        usePhysic: false,
        scale: [15, 15, 15],
        position: [-7, 1, -7],
        meshMaterialFn: getMeshItemMaterial,
        ...coodsWithText
    }),
    ...boxComposer.getObjects()
];

world.init(objects);

document.getElementById("btnBum").addEventListener("click", event => { 
    const objects = world.getInstancesOf(PBox).filter(o=>o.upFactor > 0.5)
    if (objects.length > 0) {
        const fx = 10000 * (-0.5 + Math.random())
        const fy = 10000 * (-0.5 + Math.random())
        const i = Math.trunc((objects.length - 1) * Math.random())
        const f = new CANNON.Vec3(fx, fy, 0)
        const q = objects[i].body.quaternion
        const qF = q.vmult(f)
        objects[i].body.applyForce(qF)
    } else {
        world.getInstancesOf(PBox).forEach(o => {
            o.body.applyForce(new CANNON.Vec3(0, 100000*Math.random(), 0))
            o.body.applyTorque(new CANNON.Vec3(1000*Math.random(), 1000*Math.random(), 1000*Math.random()))
        })
    }
});

// Animation loop
function animate() {
    world.update();
    requestAnimationFrame(animate);
}

animate();
