import * as THREE from 'three';

export function getMeshNoneMaterial(color) {
    return new THREE.MeshStandardMaterial({ color: color, flatShading: false, opacity: 0, transparent: true });
}

export function getMeshTransparentMaterial(color) {
    return new THREE.MeshStandardMaterial({ color: color, flatShading: false, opacity: 0.2, transparent: true });
}

export function getMeshItemMaterial(color) {
    return new THREE.MeshStandardMaterial({ color: color, flatShading: false });
}

export function getMeshWireMaterial(color) {
    return new THREE.MeshBasicMaterial({ color: color, wireframe: true });
}

export function getRedBallMaterial(color) {
    const texture = new THREE.TextureLoader().load('../../../textures/red_ball.jpg');
    
    return new THREE.MeshBasicMaterial({
        map: texture, // Используем текстуру для цвета
        color: color ? color : undefined
    });    
}

export function getBallMaterial(color) {
    const texture = new THREE.TextureLoader().load('../../../textures/ball1.png');
    
    return new THREE.MeshBasicMaterial({
        map: texture, // Используем текстуру для цвета
        color: color
    });    
}

export function getMazeBallMaterial(color) {
    const texture = new THREE.TextureLoader().load('../../../textures/maze_ball1.png');
    
    return new THREE.MeshBasicMaterial({
        map: texture, // Используем текстуру для цвета
        color: color
    });    
}