import * as THREE from 'three';
import maze_ball1 from '../../../textures/maze_ball1.png'
import ball1 from '../../../textures/ball1.png'
import dice from '../../../textures/dice.png'
import earth from '../../../textures/earth.jpg'
import { rMN } from '../VecFuncs'


export const getPlaneMaterial = color => new THREE.MeshStandardMaterial({ color: color, side: THREE.DoubleSide });


export function getMeshNoneMaterial(color) {
    return new THREE.MeshStandardMaterial({ color: color, flatShading: false, opacity: 0, transparent: true });
}

export function getMeshTransparentMaterial(color) {
    return new THREE.MeshStandardMaterial({ color: color, flatShading: false, opacity: 0.2, transparent: true });
}

export function getMeshTransparentMaterial2(color) {
    return new THREE.MeshStandardMaterial({ color: color, flatShading: false, opacity: 0.45, transparent: true });
}

export function getMeshItemMaterial(color) {
    return new THREE.MeshStandardMaterial({ color: color, flatShading: false });
}

export function getMeshWireMaterial(color) {
    return new THREE.MeshBasicMaterial({ color: color, wireframe: true });
}

function getTextureMaterial(color, url) {
    const texture = new THREE.TextureLoader().load(url);

    return new THREE.MeshBasicMaterial({
        map: texture, // Используем текстуру для цвета
        color: color ? color : undefined
    });    
}

export function getEarthMaterial(color) {
    return getTextureMaterial(color, earth)
}

export function getMazeBallMaterial(color) {
    return getTextureMaterial(color, maze_ball1)
}

export function getBallMaterial(color) {
    return getTextureMaterial(color, ball1)
}

export function getDiceCubeMaterial(color) {
    const texture = new THREE.TextureLoader().load(dice);
    let needClone = false

    return [...rMN(3, 2).map(v => {
        const [i, j] = v
        const t = needClone ? texture.clone() : texture
        needClone = true

        t.repeat.set(1/2, 1/3);
        t.offset.set(j/2, i/3);

        return new THREE.MeshBasicMaterial({
            map: t, // Используем текстуру для цвета
            color: color ? color : undefined
        })
    })] 
}
