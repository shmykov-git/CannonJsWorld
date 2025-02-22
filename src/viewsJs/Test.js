import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {PWorld, PSphere, PJumpSphere, PPolyhedron, PBox } from '../PWorld/PObjects.js'
import { getDiceCubeMaterial, getEarthMaterial, getMeshTransparentMaterial } from '../PWorld/Scene/MeshMaterials.js'
import { BoxComposer } from '../PWorld/Tools/Composer.js';
import { rand } from 'three/tsl';

const world = new PWorld({
    useGround: true,
});

const publicJson = await world.loadPublicJson()

const w30 = publicJson.models.gallery.files[11]

// one body - one mesh
const objects = [
    new PJumpSphere({ 
        radius: 1.5,
        position: [6.8, 18.5, 8], 
        color: 0x333333,
        meshMaterialFn: getMeshTransparentMaterial,
        useView: true,
        useModel: true,
        geometry: {
            type: 'icosahedron',
            detail: 5
        },
        model: {
            url: `/gallery/${w30}`,
            scale: [2, 2, 5],
            position: [0, -1, 0],
            color: 0xff0000
        },
        useSelection: true,
        selection: {
            onSelect: objectSelected
        }
    })
];

function objectSelected(obj) {
    if (obj.jump) obj.jump()
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
