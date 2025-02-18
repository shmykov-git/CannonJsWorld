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
    new PJumpSphere({ 
        id: "w30",
        radius: 1.5,
        position: [6.8, 18.5, 8], 
        color: 0x333333,
        meshMaterialFn: getMeshTransparentMaterial,
        useView: true,
        useModel: true,
        model: {
            url: "w30.glb",
            scale: [2, 2, 5],
            position: [0, -1, 0],
            color: 0xff0000
        },
        useSelection: true,
        selection: {
            onSelect: objectSelected
        }
    }), 
    new PJumpSphere({ 
        id: "santa",
        radius: 1.5,
        position: [-4, 18.5, -3], 
        color: 0x333333,
        meshMaterialFn: getMeshTransparentMaterial,
        useView: true,
        useModel: true,
        model: {
            url: "santa.glb",
            scale: [0.9, 0.9, 0.9],
            position: [0, -1.2, 0]
        },
        useSelection: true,
        selection: {
            onSelect: objectSelected
        }
    }),
];

function objectSelected(obj) {
    obj.jump()
}

world.init(objects);

document.getElementById("btnBum").addEventListener("click", event => { 
    world.getInstancesOf(PJumpSphere).forEach(o => o.jump())
});

// Animation loop
function animate() {
    world.update();
    requestAnimationFrame(animate);
}

animate();
