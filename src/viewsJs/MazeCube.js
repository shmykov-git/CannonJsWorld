import {PWorld, PSphere, PJumpSphere, PPolyhedron } from '../PWorld/PObjects.js'
import { getMeshItemMaterial, getMazeBallMaterial } from '../PWorld/Scene/MeshMaterials.js'
import { mazeCubeData, mazeCubeHolesData, mazeCubePathData } from '../PWorld/data.js'

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params.entries());
}
var queryArgs = getQueryParams();

const showBtnJump = true
const showHelp = queryArgs.showHelp;

const world = new PWorld({
    useGround: false,
    worldRadius: 20,
    cameraPosition: [0, 0, 50],
    changeGravityByCamera: true
});

const objects = [
    new PPolyhedron({
        id: "cube",
        scale: [20, 20, 20],
        color: 0x0000ff,
        complex: true,
        complexStrategy: "ManyCubes", // see shmykov-dev Algo HtmlWorlds.CubeMazeWorld(), to build this one. Example: take cube, make it smaller then join vertices and faces, keep the faces perfect
        ...mazeCubeData
    }),

    ...(showHelp ? [
        // see shmykov-dev Algo HtmlWorlds.CubeMazeWorld(), to build these
        new PPolyhedron({
            id: "cube_holes",
            usePhysic: false,
            scale: [20, 20, 20],
            color: 0x00ff00,
            meshMaterialFn: getMeshItemMaterial,
            ...mazeCubeHolesData
        }),        
        new PPolyhedron({
            id: "cube_path",
            usePhysic: false,
            scale: [20, 20, 20],
            color: 0xff0000,
            meshMaterialFn: getMeshItemMaterial,
            ...mazeCubePathData
        }),        
    ] : []),

    ...Array(1).keys().map(i => new PJumpSphere({ // check worldRadius for many
        id: "ball", 
        position: [2.5, 12 + 2*i, 2.5], 
        meshMaterialFn: getMazeBallMaterial,
        color: 0xff0000,
    }))
];

world.init(objects);

if (showBtnJump) {
    document.getElementById("btnJump").addEventListener("click", event => { 
        world.getAll("ball").forEach(ball => ball.jump());
    });
} else {
    document.getElementById("btnJump").outerHTML = ''
}

document.addEventListener("keydown", event => { 
    if (event.code === "Space")
        world.getAll("ball").forEach(ball => ball.jump());
});


// Animation loop
function animate() {
    requestAnimationFrame(animate);
    world.update();
}

animate();
