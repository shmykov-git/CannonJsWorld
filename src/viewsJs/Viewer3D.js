import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {PWorld, PSphere, PJumpSphere, PPolyhedron, PBox } from '../PWorld/PObjects.js'
import { getDiceCubeMaterial, getEarthMaterial, getMeshTransparentMaterial } from '../PWorld/Scene/MeshMaterials.js'
import { rand } from 'three/tsl';

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 5)
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5)
directionalLight.position.set(1, 2, 3)

const cameraBasePosition = [-10, 0, 20]

const world = new PWorld({
    useGround: false,
    useGravity: false,    
    orbitControlDistance: [3, 100],
    backgroundColor: 0x999999,
    cameraPosition: cameraBasePosition,
    lights: [ambientLight, directionalLight]
});

const publicJson = await world.loadPublicJson()
const files = publicJson.models.tattoos.files

let index = 0

const objects = [
    new PSphere({ 
        id: "object",
        useView: false,
        useModel: true,
        useSelection: false,
        model: {
            url: `/tattoos/${files[index]}`,
            scale: [10, 10, 10], 
        }
    })
];

world.init(objects);

function showModel() {
    const obj = world.get("object")
    obj.args.model.url = `/tattoos/${files[index]}`
    obj.loadModel()
    world.setCameraPosition(cameraBasePosition, [0, 0, 0])
}

document.getElementById("btnLeft").addEventListener("click", event => { 
    event.stopPropagation();
    event.preventDefault();    
    index = (index - 1 + files.length) % files.length
    showModel();
});

document.getElementById("btnRight").addEventListener("click", event => { 
    event.stopPropagation();
    event.preventDefault();    
    index = (index + 1) % files.length
    showModel();
});

document.getElementById("btnBg1").addEventListener("click", event => { 
    event.stopPropagation();
    event.preventDefault();    
    world.scene.background = new THREE.Color(0x202020);
});

document.getElementById("btnBg2").addEventListener("click", event => { 
    event.stopPropagation();
    event.preventDefault();    
    world.scene.background = new THREE.Color(0xEEEEEE);
});

document.getElementById("btnBg3").addEventListener("click", event => { 
    event.stopPropagation();
    event.preventDefault();    
    world.scene.background = new THREE.Color(0x999999);
});


// Animation loop
function animate() {
    world.update();
    requestAnimationFrame(animate);
}

animate();
