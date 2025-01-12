import * as THREE from 'three';
import { PObject } from './PObject.js'
import * as CANNON from 'cannon-es';
import { getMeshTransparentMaterial, getMeshWireMaterial } from '../Scene/MeshMaterials.js'
import { pItemMaterial } from '../World/PhysicMaterials.js'

// Class to handle physics and visual representation of shpere
export class PShere extends PObject {
    constructor(args) {
        args = { ...{
            id: "sphere",
            mass: 1,
            radius: 1, 
            position: [0, 0, 0],
            pMaterial: pItemMaterial,
            meshMaterialFn: getMeshWireMaterial,
            color: 0xff0000
        }, ...args}

        // Create physics body
        const pShape = new CANNON.Sphere(args.radius);

        // Create visual representation
        const geometry = new THREE.IcosahedronGeometry(args.radius, 2);

        const material = args.meshMaterialFn ? args.meshMaterialFn(args.color) : getMeshWireMaterial(args.color);
        const mesh = new THREE.Mesh(geometry, material);

        super(args, [pShape], mesh)
    }
}