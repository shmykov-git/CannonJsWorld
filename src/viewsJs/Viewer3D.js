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

const urlParams = new URLSearchParams(window.location.search)
let index = urlParams.get('index') ?? 0
let files = []

world.loadPublicJson().then(publicJson => {
    files = publicJson.models.tattoos.files
    showModel()
})

const objects = [
    new PSphere({ 
        id: "object",
        useView: false,
        useModel: true,
        useSelection: false,
        model: {
            url: undefined,
            scale: [10, 10, 10], 
        }
    })
];

world.init(objects);    

// Animation loop
function animate() {
    world.update();
    requestAnimationFrame(animate);
}

animate();


function updateQueryParam(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value); // Устанавливаем новый параметр
    window.history.pushState({}, '', url); // Меняем URL без перезагрузки
}

function showModel(btn) {
    btnLeft.disabled = true
    btnRight.disabled = true
    if (btn == btnLeft) btn.classList.add('spin-left')
    if (btn == btnRight) btn.classList.add('spin-right')
    updateQueryParam("index", index)
    const obj = world.get("object")
    obj.args.model.url = `/tattoos/${files[index]}`

    obj.loadModel(m => {
        world.setCameraPosition(cameraBasePosition, [0, 0, 0])
        btnLeft.disabled = false
        btnRight.disabled = false
        btnLeft.classList.remove('spin-left')
        btnRight.classList.remove('spin-right')
    })
}

const btnLeft = document.getElementById("btnLeft")
const btnRight = document.getElementById("btnRight")

btnLeft.addEventListener("click", event => { 
    event.stopPropagation();
    event.preventDefault();    
    index = (index - 1 + files.length) % files.length
    showModel(btnLeft);
});

btnRight.addEventListener("click", event => { 
    event.stopPropagation();
    event.preventDefault();    
    index = (index + 1) % files.length
    showModel(btnRight);
});

document.getElementById("btnBg1").addEventListener("click", event => { 
    event.stopPropagation();
    event.preventDefault();    
    world.scene.background = new THREE.Color(0xEEEEEE);
});

document.getElementById("btnBg2").addEventListener("click", event => { 
    event.stopPropagation();
    event.preventDefault();    
    world.scene.background = new THREE.Color(0x999999);
});

document.getElementById("btnBg3").addEventListener("click", event => { 
    event.stopPropagation();
    event.preventDefault();    
    world.scene.background = new THREE.Color(0x202020);
});


