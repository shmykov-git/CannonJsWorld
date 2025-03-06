import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {PWorld, PSphere, PJumpSphere, PPolyhedron, PBox } from '../PWorld/PObjects.js'
import { getMeshTransparentMaterial03, getDiceCubeMaterial, getEarthMaterial, getMeshWireMaterial } from '../PWorld/Scene/MeshMaterials.js'
import { BoxComposer } from '../PWorld/Tools/Composer.js';
import { domino } from '../PWorld/composeData.js'
import { rand } from 'three/tsl';


const world = new PWorld({
    cameraPosition: [100, 20, 20],
    gravity: [0, -100, 0],
    useGround: true,
    ground: {
        size: [100, 100, 5, 100],
        color: 0x22ff44,
        type: "cylinder",
        meshMaterialFn: getMeshTransparentMaterial03
    },
    useWorldRadius: true,    
    worldRadius: 100,
    orbitControlDistance: [1, 200]
});

const boxComposer = new BoxComposer({
    // position: [0, 2.5, 0],
    color: 0x0000ff,
    // itemMass: 200,
    ...domino
})

// one body - one mesh
const objects = [
    ...boxComposer.getObjects()
];

world.init(objects);

document.getElementById("btnBum").addEventListener("click", event => { 
    const objects = world.getInstancesOf(PBox).filter(o=>o.upFactor > 0.5)
    if (objects.length > 0) {
        const force = 10000 * (1 + Math.random())
        const i = Math.trunc((objects.length - 1) * Math.random())
        const f = new CANNON.Vec3(0, 0, force)
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
