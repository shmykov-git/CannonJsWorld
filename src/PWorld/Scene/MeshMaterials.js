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