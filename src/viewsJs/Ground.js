import {PWorld, PShere, PJumpSphere, PPolyhedron, PBox } from '../PWorld/PObjects.js'
import { getDiceCubeMaterial, getEarthMaterial, getMeshWireMaterial } from '../PWorld/Scene/MeshMaterials.js'


const world = new PWorld({
    cameraPosition: [0, 20, 30],
    useGround: true,
    groundSize: [50, 50],
    useWorldRadius: false,
    changeGravityByCamera: false
});

const objects = [
    // new PPolyhedron({
    //     id: "cube",
    //     vertices: [[-10,-10,-10],[10,-10,-10],[10,10,-10],[-10,10,-10],[-10,-10,10],[10,-10,10],[10,10,10],[-10,10,10],[-10.5,-10.5,-10.5],[10.5,-10.5,-10.5],[10.5,10.5,-10.5],[-10.5,10.5,-10.5],[-10.5,-10.5,10.5],[10.5,-10.5,10.5],[10.5,10.5,10.5],[-10.5,10.5,10.5]], 
    //     faces: [[1,2,3],[1,3,0],[4,5,1],[4,1,0],[3,7,4],[3,4,0],[2,1,5],[2,5,6],[7,3,2],[7,2,6],[5,4,7],[5,7,6],[8,11,10],[8,10,9],[8,9,13],[8,13,12],[8,12,15],[8,15,11],[14,13,9],[14,9,10],[14,10,11],[14,11,15],[14,15,12],[14,12,13]], 
    //     color: 0x00ff00,
    //     scale: [1.5, 1.5, 1.5],
    //     position: [17, 17, 17],
    //     complex: true,
    //     // meshMaterialFn: getMeshWireMaterial,
    //     // debugShapes: true,
    //     complexStrategy: "NormalVolumeAsBox" // see shmykov-dev Algo, to build this one. Example: take cube, make it smaller then join vertices and faces, keep faces perfect
    // }),

    // new PBox({
    //     position: [2, 8, 2],
    //     size: [4,4,4],
    //     color: 0xff0000,
    //     meshMaterialFn: getDiceCubeMaterial
    // }),

    new PJumpSphere({ 
        id: "Earth", 
        radius: 3,
        position: [5, 5, 5], 
        color: 0xdddddd,
        meshMaterialFn: getEarthMaterial
        // modelPath: "../models/santa_model.glb", // todo
    }),        

    // ...Array(4).keys().map(i => 
    //     new PJumpSphere({ 
    //         id: "ball", 
    //         radius: 1 + i/5,
    //         position: [-2, 2.1 * i, -2], 
    //         color: 0x0000ff + 256 * i * 50 
    // }))        
];

world.init(objects);


document.addEventListener("keydown", event => 
{ 
    if (event.code === "Space")
        world.getInstancesOf(PJumpSphere).forEach(ball => ball.jump());
});


// Animation loop
function animate() {
    world.update();
    requestAnimationFrame(animate);
}

animate();
