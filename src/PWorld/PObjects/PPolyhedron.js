import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PObject } from './PObject.js';
import { getMeshTransparentMaterial, getMeshWireMaterial } from '../Scene/MeshMaterials.js'
import { pWallMaterial } from '../World/PhysicMaterials.js'
import * as vfn from '../VecFuncs.js'
import { getBufferGeometry, getPolyhedronShapesByFaces, getBoxShapesByFaces } from '../PFuncs.js'

export class PPolyhedron extends PObject {
    constructor(args) {
        args = {
            id: "polyhedron",
            mass: 0,
            static: true,
            position: [0, 0, 0],
            pMaterial: pWallMaterial,
            meshMaterialFn: getMeshTransparentMaterial,
            color: 0x00ff00,
            usePhysic: true,
            debugMesh: false,
            debugColor: 0xff0000,
            asBoxNumber: undefined,
            asBoxRotate: false,
            // collider: {
            //     vertices: [],
            //     faces: []
            // },
            ...args
        }

        if (args.scale) {
            args.vertices = vfn.scaleA(args.vertices, args.scale);
            
            if (args.collider)
                args.collider.vertices = vfn.scaleA(args.collider.vertices, args.scale);
        }
        
        // see shmykov-dev Algo, to build this one. Example: take cube, make it smaller then join vertices and faces, keep faces perfect
        function getNormalVolumeStrategyShapes(vertices, faces) {
            let n = faces.length / 2;
            let bodiesFaces = [...Array(n/2).keys().map(i => [faces[2*i], faces[2*i+1], faces[2*i+n], faces[2*i+1+n]])];
            return getPolyhedronShapesByFaces(vertices, bodiesFaces);
        }

        function getNormalVolumeAsBoxStrategyShapes(vertices, faces, n = undefined) {
            n ??= faces.length / 2;
            let bodiesFaces = [...Array(n/2).keys().map(i => [faces[2*i], faces[2*i+1], faces[2*i+n], faces[2*i+1+n]])];
            return getBoxShapesByFaces(vertices, bodiesFaces, args.asBoxRotate);
        }

        function getNormalVolumeNearStrategyShapes(vertices, faces) {
            let n = faces.length / 2;
            let bodiesFaces = [...Array(n/2).keys().map(i => [faces[2*i], faces[2*i+1]])];
            return getPolyhedronShapesByFaces(vertices, bodiesFaces);
        }

        function getColliderAsBoxStrategyShapes(vertices, faces) {
            let n = faces.length;
            let bodiesFaces = [...Array(n/2).keys().map(i => [faces[2*i], faces[2*i+1]])];
            return getPolyhedronShapesByFaces(vertices, bodiesFaces);
        }

        function getNormalVolumeFarStrategyShapes(vertices, faces) {
            let n = faces.length / 2;
            let bodiesFaces = [...Array(n/2).keys().map(i => [faces[2*i+n], faces[2*i+1+n]])];
            return getPolyhedronShapesByFaces(vertices, bodiesFaces);
        }

        // see shmykov-dev Algo, to build this one. Example: take many cubes, join them to a single shape, it takes them back
        function getManyCubesStrategyShapes(vertices, faces) {
            let m = 12;
            let n = faces.length / m;
            let bodiesFaces = Array(n).keys().map(i => faces.slice(m*i, m*i+m))
            return getPolyhedronShapesByFaces(vertices, bodiesFaces);
        }

        // Создаем многогранник (Polyhedron) в мире
        let shapes = []
        if (args.usePhysic) {
            const vertices = args.collider ? args.collider.vertices : args.vertices
            const faces = args.collider ? args.collider.faces : args.faces
            if (args.complex) {       
                switch (args.complexStrategy)
                {
                    case "NormalVolume":
                        shapes = getNormalVolumeStrategyShapes(vertices, faces);
                        break;
                    case "NormalVolumeAsBox":
                        shapes = getNormalVolumeAsBoxStrategyShapes(vertices, faces, args.asBoxNumber);
                        break;
                    case "NormalVolumeFar":
                        shapes = getNormalVolumeFarStrategyShapes(vertices, faces);
                        break;
                    case "NormalVolumeNear":
                        shapes = getNormalVolumeNearStrategyShapes(vertices, faces);
                        break;
                    case "ManyCubes":
                        shapes = getManyCubesStrategyShapes(vertices, faces);
                        break;
                    case "ColliderAsBox":
                        shapes = getColliderAsBoxStrategyShapes(vertices, faces);
                        break;                            
                    default:
                        throw new Error(`${args.complexStrategy} is not implemented`);
                }
            } else {
                shapes = getPolyhedronShapesByFaces(vertices, [faces]);
            }
        }

        // Создаем представление многогранника на сцене
        const geometry = getBufferGeometry(args.vertices, args.faces)

        super(args, shapes, geometry)
    }

    initDebugMesh() {
        const args = this.args

        if (args.debugShapes && args.complexStrategy.includes("AsBox")) {
            const group = new THREE.Group()
            
            shapes.forEach(scq => {
                const [s, c, q] = this.getVcq(scq)                
                const gBox = new THREE.BoxGeometry(2 * s.halfExtents.x, 2 * s.halfExtents.y, 2 * s.halfExtents.z);
                const mBox = getMeshWireMaterial(args.debugColor)
                const meshBox = new THREE.Mesh(gBox, mBox);
                meshBox.quaternion.set(q.x, q.y, q.z, q.w)
                meshBox.position.set(c[0], c[1], c[2])
                group.add(meshBox)
            })
            
            this.scene.add(group);
        } else {
            super.initDebugMesh();
        }
    }
}