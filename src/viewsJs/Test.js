import {PWorld, PShere, PJumpSphere, PPolyhedron, PBox } from '../PWorld/PObjects.js'

const world = new PWorld({
    cameraPosition: [0, 5, 10],
});

const objects = [
    new PBox({
        position: [0, 5, 0]
        // static: true,
    }),
];

world.init(objects);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    world.update();
}

animate();
