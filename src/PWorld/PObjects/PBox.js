import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PObject } from './PObject.js';
import { getMeshWireMaterial, getMeshItemMaterial } from '../Scene/MeshMaterials.js'
import * as vfn from '../VecFuncs.js'
import { setQuaternionFromProperEuler } from 'three/src/math/MathUtils.js';

// Class to handle physics and visual representation of Box
export class PBox extends PObject {
    constructor(args) {
        args = {
            id: 'box',
            size: [1, 1, 1],
            color: 0x00ff00,
            massByVolume: true,
            meshMaterialFn: getMeshItemMaterial,
            ...args
        }

        if (args.massByVolume && !args.mass)
            args.mass = args.size[0] * args.size[1] * args.size[2];

        // Create physics body
        const shape = new CANNON.Box(new CANNON.Vec3(...args.size.map(v => v/2)));
        // Create visual representation
        const geometry = new THREE.BoxGeometry(args.size[0], args.size[1], args.size[2]);

        super(args, [shape], geometry)
    }

    // update () {
    //     super.update()

    //     if (!this.prevPosition) {
    //         this.prevPosition = new CANNON.Vec3()
    //         this.prevPosition.copy(this.body.position)
    //     }

    //     if (!this.prevPosition.almostEquals(this.body.position, 1e-4))
    //     {
    //         this.body.position.copy(this.prevPosition)
    //     }
    // }
}
