import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PObject } from './PObject.js';
import { getMeshTransparentMaterial, getMeshWireMaterial } from '../Scene/MeshMaterials.js'
import { pPolyhedronMaterial } from '../World/PhysicMaterials.js'
import { scale } from '../ArrayFuncs.js'
import { getPolyhedronBodiesByFaces } from '../PFuncs.js'

// todo: CANNON.Trimesh - можно невыпуклые формы
export class PPolyhedron extends PObject {
    constructor(args) {
        args = { ...{
            id: "polyhedron",
            mass: 0,
            static: true,
            position: [0, 0, 0],
            pMaterial: pPolyhedronMaterial,
            meshMaterialFn: getMeshTransparentMaterial,
            color: 0x00ff00,
            usePhysic: true
        }, ...args}

        if (args.scale) {
            args.vertices = scale(args.vertices, args.scale);
        }
        
        // see shmykov-dev Algo, to build this one. Example: take cube, make it smaller then join vertices and faces, keep faces perfect
        function getNormalVolumeStrategyBodies() {
            let n = args.faces.length / 2;
            let bodiesFaces = [...Array(n/2).keys().map(i => [args.faces[2*i], args.faces[2*i+1], args.faces[2*i+n], args.faces[2*i+1+n]])];
            return getPolyhedronBodiesByFaces(args.vertices, bodiesFaces);
        }

        // see shmykov-dev Algo, to build this one. Example: take many cubes, join them to a single shape, it takes them back
        function getManyCubesStrategyBodies() {
            let m = 12;
            let n = args.faces.length / m;
            let bodiesFaces = Array(n).keys().map(i => args.faces.slice(m*i, m*i+m))
            return getPolyhedronBodiesByFaces(args.vertices, bodiesFaces);
        }

        // Создаем многогранник (Polyhedron) в мире
        let bodies = []
        if (args.usePhysic) {
            if (args.complex) {       
                switch (args.complexStrategy)
                {
                    case "NormalVolume":
                        bodies = getNormalVolumeStrategyBodies();
                        break;
                    case "ManyCubes":
                        bodies = getManyCubesStrategyBodies();
                        break;
                    default:
                        throw new Error(`${args.complexStrategy} is not implemented`);
                }
            } else {
                bodies = getPolyhedronBodiesByFaces(args.vertices, [args.faces]);
            }
        }

        // Создаем представление многогранника на сцене
        const gVertices = new Float32Array(args.vertices.flatMap(v => v))
        const gIndices = new Uint16Array(args.faces.flatMap(fs => fs.flatMap(i => i)))
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(gVertices, 3))
        geometry.setIndex(new THREE.BufferAttribute(gIndices, 1))
        const material = args.meshMaterialFn ? args.meshMaterialFn(args.color) : getMeshWireMaterial(args.color);
        const mesh = new THREE.Mesh(geometry, material);

        super(args, bodies, mesh)
    }
}