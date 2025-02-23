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
    orbitControlDistance: [3, 300],
    backgroundColor: 0x999999,
    cameraPosition: cameraBasePosition,
    lights: [ambientLight, directionalLight]
});

const urlParams = new URLSearchParams(window.location.search)
let index = urlParams.get('index') ?? 0
updateQueryParam('index', undefined)
let files = []

world.loadPublicJson().then(publicJson => {
    files = [
        ...publicJson.models.tattoos.files.map(f => `tattoos--${f}`),
        ...publicJson.models.mains.files.map(f => `mains--${f}`),
        ...publicJson.models.Composed.files.map(f => `Composed--${f}`),
        ...publicJson.models.development.files.map(f => `development--${f}`),
        ...publicJson.models.forms.files.map(f => `forms--${f}`),
        ...publicJson.models.Composed.SimpleBeauty.files.map(f => `Composed--SimpleBeauty--${f}`),
    ]

    if (urlParams.get('id')) {
        let fileName = decodeURIComponent(urlParams.get('id')).toLowerCase()
        index = files.findIndex(f => f.toLowerCase() == fileName)
        if (index < 0) index = files.findIndex(f => f.toLowerCase().startsWith(fileName))
        if (index < 0) index = files.findIndex(f => f.toLowerCase().includes(fileName))
        if (index < 0) index = 0
    }
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
    const url = new URL(window.location)
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
    window.history.pushState({}, '', url)
}

function showModel(btn) {
    btnLeft.disabled = true
    btnRight.disabled = true
    if (btn == btnLeft) btn.classList.add('spin-left')
    if (btn == btnRight) btn.classList.add('spin-right')
    updateQueryParam("id", encodeURIComponent(files[index]))
    const obj = world.get("object")
    obj.args.model.url = files[index].replaceAll("--", "/")

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

document.addEventListener("keydown", event => { 
    if (event.code === "Space" || event.code === "ArrowRight") {
        index = (index + 1) % files.length
        showModel(btnRight);    
    }
    if (event.code === "ArrowLeft") {
        index = (index - 1 + files.length) % files.length
        showModel(btnLeft);    
    }
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


