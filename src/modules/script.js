import {PWorld, PShere, PJumpSphere, PPolyhedron } from './PWorld/PObjects.js'
import { pPolyhedronMaterial, pItemMaterial } from './PWorld/World/PhysicMaterials.js'


const world = new PWorld({
    cameraPosition: [0, 0, 50]
});

const objects = [
    new PPolyhedron({
        id: "cube",
        vertices: [[-10,-10,-10],[10,-10,-10],[10,10,-10],[-10,10,-10],[-10,-10,10],[10,-10,10],[10,10,10],[-10,10,10],[-10.5,-10.5,-10.5],[10.5,-10.5,-10.5],[10.5,10.5,-10.5],[-10.5,10.5,-10.5],[-10.5,-10.5,10.5],[10.5,-10.5,10.5],[10.5,10.5,10.5],[-10.5,10.5,10.5]], 
        faces: [[1,2,3],[1,3,0],[4,5,1],[4,1,0],[3,7,4],[3,4,0],[2,1,5],[2,5,6],[7,3,2],[7,2,6],[5,4,7],[5,7,6],[8,11,10],[8,10,9],[8,9,13],[8,13,12],[8,12,15],[8,15,11],[14,13,9],[14,9,10],[14,10,11],[14,11,15],[14,15,12],[14,12,13]], 
        color: 0x00ff00,
        complex: true,
        complexStrategy: "NormalVolume"
    }),

    new PJumpSphere({ 
        id: "ball", 
        radius: 2,
        position: [2.5, 3, 2.5], 
        color: 0x0000ff,
        jumpPower: 100,
        modelPath: "../models/santa_model.glb", // todo
        jumpOnSpace: true, // todo
        // jumbBtn: btnId
    }),        
];

world.init(objects);


document.addEventListener("keydown", event => 
{ 
    if (event.code === "Space")
        world.get("ball").jump()    
});


// Animation loop
function animate() {
    requestAnimationFrame(animate);
    world.update();
}

animate();
