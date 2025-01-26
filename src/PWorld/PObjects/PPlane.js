import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PObject } from './PObject.js';
import { getMeshWireMaterial, getPlaneMaterial } from '../Scene/MeshMaterials.js'
import { pWallMaterial } from '../World/PhysicMaterials.js'

export class PPlane extends PObject {
    constructor(args) {
        args = {
            id: 'plane',
            size: [20, 20],
            position: [0, 0, 0],
            color: 0x008800,
            // mass: 0,
            static: true,
            meshMaterialFn: getPlaneMaterial,
            pMaterial: pWallMaterial,
            ...args
        }

        const q = new CANNON.Quaternion()
        q.setFromEuler(-Math.PI / 2, 0, 0); // Rotate physic body and view mesh to horizontal
        
        const shape = new CANNON.Plane()
        const geometry = new THREE.PlaneGeometry(...args.size);

        super(args, [[shape, [0, 0, 0], q]], [geometry, [0, 0, 0], q])
    }
}