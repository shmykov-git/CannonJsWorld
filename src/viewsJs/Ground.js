import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {PWorld, PShere, PJumpSphere, PPolyhedron, PBox } from '../PWorld/PObjects.js'
import { getDiceCubeMaterial, getEarthMaterial, getMeshWireMaterial } from '../PWorld/Scene/MeshMaterials.js'
import { BoxComposer } from '../PWorld/Tools/Composer.js';


const world = new PWorld({
    cameraPosition: [10, 20, 30],
    useGround: true,
    groundSize: [50, 50],
    useWorldRadius: true,    
    worldRadius: 50
});

const boxComposer = new BoxComposer({
    color: 0x0000ff,
    data: [
        [[5,10,1], [0,5,0], [0,0,0,1]],
        [[5,10,1], [0,5,3], [0,0,0,1]],
        [[5,10,1], [0,5,6], [0,0,0,1]],
        [[5,10,1], [0,5,9], [0,0,0,1]],
        [[5,10,1], [0,5,12], [0,0,0,1]],
    ]
})

// one body - one mesh
const objects = [
    ...boxComposer.getObjects()
];

world.init(objects);

// world.update();
world.getInstancesOf(PBox)[0].body.applyForce(new THREE.Vector3(0, 0, 5000))

// Animation loop
function animate() {
    world.update();
    requestAnimationFrame(animate);
}

animate();
