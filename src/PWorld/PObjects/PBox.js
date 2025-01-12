import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PObject } from './PObject.js';
import { getMeshWireMaterial } from '../Scene/MeshMaterials.js'

// Class to handle physics and visual representation of Box
export class PBox extends PObject {
    constructor(args) {
        const halfExtents = new CANNON.Vec3(args.size[0], args.size[1], args.size[2]);
        // Create physics body
        const pShape = new CANNON.Box(halfExtents);

        // Create visual representation
        const geometry = new THREE.BoxGeometry(args.size[0], args.size[1], args.size[2]);;

        const material = args.meshMaterialFn ? args.meshMaterialFn(args.color) : getMeshWireMaterial(args.color);
        const mesh = new THREE.Mesh(geometry, material);

        super(args, [pShape], mesh)
    }
}