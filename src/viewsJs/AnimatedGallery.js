import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import {PWorld, PSphere, PJumpSphere, PPolyhedron, PBox } from '../PWorld/PObjects.js'
import { getDiceCubeMaterial, getWoodMaterial, getMeshTransparentMaterial, getMeshTransparentMaterial45, getMeshTransparentMaterial90, getMeshWireMaterial, getMeshBasicMaterial, getMeshItemMaterial } from '../PWorld/Scene/MeshMaterials.js'
import { BoxComposer } from '../PWorld/Tools/Composer.js';
import { color, rand } from 'three/tsl';
import { rCircleFi, rotateY } from '../PWorld/VecFuncs.js'

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
}
const queryArgs = getQueryParams();
const listId = queryArgs?.list ?? 0

const fallY = 8
const itemRadius = 8
const worldRadius = 10
const worldCamera = [10, 50]
const cameraPosition = [5, 10, 15]

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 5)
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5)
directionalLight.position.set(1, 2, 3)

const world = new PWorld({
    cameraPosition: cameraPosition,
    useGround: true,
    ground: {
        type: "cylinder",
        size: [worldRadius, worldRadius, 0.2, 200],
        color: 0x376e2f,
        meshMaterialFn: getMeshTransparentMaterial45
    },
    orbitControlDistance: [0.01, worldRadius * 8],
    lights: [ambientLight, directionalLight]
});


const baseArgs = { 
    radius: 1.5,
    color: 0x333333,
    meshMaterialFn: getMeshTransparentMaterial,
    useView: true,
    useModel: true,
    geometry: {
        type: 'icosahedron',
        detail: 6
    },
    useSelection: true,
    selection: {
        onSelect: objectSelected
    }
}

const listOfModels = [
    [
        {
            url: "actives/egsStrike.glb",
            scale: [2, 2, 2],
            position: [0, 0.5, 0]
        },
        {
            url: "actives/interaction.glb",
            scale: [2, 2, 2],
            position: [0, 0.5, 0]
        },
        {
            url: "actives/ballRacing.glb",
            scale: [2, 2, 2],
            position: [0, 1.5, 0]
        },
        {
            url: "actives/waterfall1.glb",
            scale: [2, 2, 2],
            position: [0, 0, 0]
        },
        {
            url: "actives/waterfall2.glb",
            scale: [2, 2, 2],
            position: [0, 0, 0]
        },
        {
            url: "actives/twoStones.glb",
            scale: [2, 2, 2],
            position: [0, 1.5, 0]
        },
        {
            url: "actives/gravity/heart.glb",
            scale: [1.5, 1.5, 1.5],
            position: [-1.8, 0, 0]
        },
    ],
    [
        {
            url: "actives/material/bullet.glb",
            scale: [2, 2, 2],
            position: [0, 2.7, 8.5]
        },
        {
            url: "actives/material/standing1.glb",
            scale: [2, 2, 2],
            position: [0, 5, 0]
        },
        {
            url: "actives/material/standing2.glb",
            scale: [2, 2, 2],
            position: [0, 5, 0]
        },
        {
            url: "actives/material/fall1.glb",
            scale: [2, 2, 2],
            position: [0, 0, 0]
        },
        {
            url: "actives/material/rotation.glb",
            scale: [2, 2, 2],
            position: [0, 1.5, 0]
        },        
        {
            url: "actives/world/cube.glb",
            scale: [2, 2, 2],
            position: [0, 3, 0],
            animate: {
                slowMotion: 3
            }     
        },
        {
            url: "actives/world/dodecahedron.glb",
            scale: [2, 2, 2],
            position: [0, 2, 0],
            animate: {
                slowMotion: 3
            }     
        },
        {
            url: "actives/world/mobius.glb",
            scale: [2, 2, 2],
            position: [0, 2, 0],
            animate: {
                slowMotion: 3
            }     
        },
        {
            url: "actives/world/table.glb",
            scale: [2, 2, 2],
            position: [0, 1.5, 0]
        },
        {
            url: "actives/world/PlasticTree.glb",
            scale: [2, 2, 2],
            position: [0, 2, 0],
            materials: [
                getMeshBasicMaterial(0x0000ff), 
                getMeshBasicMaterial(0x0000ff),
                getMeshBasicMaterial(0x0000ff),
                getMeshBasicMaterial(0x0000ff),
                getWoodMaterial(0xffffff),
                getMeshBasicMaterial(0xaa0000),
            ]
        },
    ],
    [
        {
            url: "actives/fractal/tree.glb",
            scale: [0.4, 0.4, 0.4],
            position: [0,-1, 0]            
        },
        {
            url: "actives/world/cut.glb",
            scale: [1, 1, 1],
            position: [0, 1, 0],
            animate: {
                slowMotion: 1
            }     
        },
        {
            url: "actives/ai/wave.glb",
            scale: [1.5, 1.5, 1.5],
            position: [0, 0, 0],
            animate: {
                slowMotion: 5
            } 
        },
        {
            url: "actives/material/bullet2.glb",
            scale: [2, 2, 2],
            position: [-2.5, 0, 0]
        },
    ]
]

const models = listOfModels[listId]

const positions = [...rCircleFi(models.length, itemRadius).map(p => [[p[0], fallY, p[1]], rotateY(p[2])])]

const objects = models.map((model, i) => 
    new PSphere({
        ...baseArgs,
        position: positions[i][0], 
        quaternion: positions[i][1],
        model: {
            ...model,
            useAnimate: true,
            url: model.url
        }
    })
)

world.init(objects);


function objectSelected(obj) {
    if (world.attachArgs && world.attachArgs.object) {
        world.attachArgs.object.showView()
        world.attachArgs.object.stopAnimate()
    }

    obj.hideView()
    obj.startAnimate()

    world.attachCamera({
        object: obj,
        distance: [0.01, 3],
        acceleration: 0.03,
        strategy: "DistanceFollowing"
    })
}

document.getElementById("btnDetach").addEventListener("click", event => { 
    if (world.attachArgs && world.attachArgs.object) {
        world.attachArgs.object.showView()
        world.attachArgs.object.stopAnimate()
    }
    event.stopPropagation()

    world.attachCamera({
        targetPositionFn: () => new THREE.Vector3(0, 0, 0),
        distance: worldCamera,
        acceleration: 0.005,
        strategy: "DistanceFollowing"
    })
});


// Animation loop
function animate() {
    world.update();
    requestAnimationFrame(animate);
}

animate();
