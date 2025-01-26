import * as THREE from 'three';
import { PObject } from './PObject.js'
import * as CANNON from 'cannon-es';
import { getMeshTransparentMaterial, getMeshWireMaterial } from '../Scene/MeshMaterials.js'
import { pItemMaterial } from '../World/PhysicMaterials.js'


function getVolume(radius) {
    return 4/3 * Math.PI * Math.pow(radius, 3);
}

// Class to handle physics and visual representation of shpere
export class PShere extends PObject {
    constructor(args) {
        args = {
            id: "sphere",
            radius: 1, 
            massByVolume: true,
            position: [0, 0, 0],
            meshMaterialFn: getMeshWireMaterial,
            color: 0xff0000,
            geometry: {
                type: 'sphere',
                size: [20, 10],
                detail: 2
            },
            ...args
        }

        // calculated args
        if (args.massByVolume && !args.mass)
            args.mass = getVolume(args.radius);

        // Create physics shape
        const shape = new CANNON.Sphere(args.radius);

        // Create geometry of view
        let geometry;
        if (args.geometry.type == 'sphere')
            geometry = new THREE.SphereGeometry(args.radius, args.geometry.size[0], args.geometry.size[1]);
        if (args.geometry.type == 'icosahedron')
            geometry = new THREE.IcosahedronGeometry(args.radius, args.geometry.detail);

        super(args, [shape], geometry)
    }

}