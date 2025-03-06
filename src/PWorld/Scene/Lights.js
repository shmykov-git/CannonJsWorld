import * as THREE from 'three';

export const ambientLight = new THREE.AmbientLight(0xFFFFFF, 5)

export const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 5)
directionalLight.position.set(-5, 2, 3)

export default [
    ambientLight,
    directionalLight
]
