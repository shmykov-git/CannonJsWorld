import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PObject } from './PObject.js';
import { getMeshWireMaterial, getPlaneMaterial } from '../Scene/MeshMaterials.js'
import { getBufferGeometry } from '../PFuncs.js'
import { pWallMaterial } from '../World/PhysicMaterials.js'
import { madelbrotData } from '../data.js'
import { scaleA, addA } from '../VecFuncs.js'

export class PPlane extends PObject {
    constructor(args) {
        args = {
            id: 'plane',
            size: [20, 20],
            position: [0, 0, 0],
            color: 0x008800,
            type: "plane",
            // mass: 0,
            static: true,
            meshMaterialFn: getPlaneMaterial,
            pMaterial: pWallMaterial,
            ...args
        }

        const q = new CANNON.Quaternion(0, 0, 0, 1)
        let qG = new CANNON.Quaternion(0, 0, 0, 1)
        let pG = [0, 0, 0]
        q.setFromEuler(-Math.PI / 2, 0, 0); // Rotate physic body and view mesh to horizontal
        qG.copy(q)

        const shape = new CANNON.Plane()
        let geometry
        switch (args.type) {
            case "plane":
                geometry = new THREE.PlaneGeometry(...args.size)
                break;
            case "box":
                geometry = new THREE.BoxGeometry(...args.size)
                break;
            case "cylinder":
                geometry = new THREE.CylinderGeometry(...args.size)
                pG = [0, -args.size[2]/2, 0]
                qG = new CANNON.Quaternion(0, 0, 0, 1)
                break;
            case "mandelbrot":
                const max = Math.max(...args.size) * 1.3
                geometry = getBufferGeometry(scaleA(addA(madelbrotData.vertices, [0, 0, 0.2]), [max, max, max]), madelbrotData.faces)
                qG = new CANNON.Quaternion(0, 0, 0, 1)
                break;
            default:
                geometry = new THREE.PlaneGeometry(...args.size)
                break;
        }

        super(args, [[shape, [0, 0, 0], q]], [geometry, pG, qG])
    }
}