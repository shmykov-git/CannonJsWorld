import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PObject } from './PObject.js';
import { getMeshWireMaterial } from '../Scene/MeshMaterials.js'

// Class to handle physics and visual representation of Cylinder
export class PCylinder extends PObject {
    constructor(args) {
        // Create physics body
        const pShape = new CANNON.Cylinder(args.radiusTop, args.radiusBottom, args.height, 5);

        // Create visual representation
        const geometry = new THREE.CylinderGeometry(args.radiusTop, args.radiusBottom, args.height, 5);

        const material = args.meshMaterialFn ? args.meshMaterialFn(args.color) : getMeshWireMaterial(args.color);
        const mesh = new THREE.Mesh(geometry, material);

        super(args, [pShape], mesh)
    }
}