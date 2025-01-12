import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PObject } from './PObject.js';
import { getMeshTransparentMaterial, getMeshWireMaterial } from '../Scene/MeshMaterials.js'
import { pPolyhedronMaterial } from '../World/PhysicMaterials.js'


// todo: functions

function normalizeShape(faces0, vertices0) {
    let faces = [...new Set(faces0.flatMap(f => f))].sort((a, b) => a - b)
    let nVertices = [...faces.map(i => vertices0[i])]
    let bi = Object.fromEntries(faces.map((i, j) => [i, j]));
    let nFaces = [...faces0.map(f => [bi[f[0]], bi[f[1]], bi[f[2]]])]
    return [nFaces, nVertices]
}

function inverseFaces(faces) {
    return faces.map(f => [f[0], f[2], f[1]])
}

function multPoints(mult, points) {
    return points.map(p => [mult * p[0], mult * p[1], mult * p[2]])
}

function addPoints(v, points) {
    return points.map(p => [v + p[0], v + p[1], v + p[2]])
}

export class PPolyhedron extends PObject {
    constructor(args) {
        args = { ...{
            id: "polyhedron",
            mass: 0,
            static: true,
            position: [0, 0, 0],
            pMaterial: pPolyhedronMaterial,
            meshMaterialFn: getMeshTransparentMaterial,
            color: 0x00ff00
        }, ...args}

        let pShapes = []
        
        if (args.scale) {
            args.vertices = [...args.vertices.map(v => [args.scale[0] * v[0], args.scale[1] * v[1], args.scale[2] * v[2]])];
        }

        // Создаем многогранник (Polyhedron) в мире
        if (args.complex) {
            
            // see shmykov-dev Algo, to build this one. Example: take cube, make it smaller then join vertices and faces, keep faces perfect
            if (args.complexStrategy == "NormalVolume") {
                // todo: CANNON.Trimesh - можно невыпуклые формы
                // структура faces: [[],[]... (l), [],[]... (l)]
                let n = args.faces.length / 2;
                let bodiesFaces = [...Array(n/2).keys().map(i => [args.faces[2*i], args.faces[2*i+1], args.faces[2*i+n], args.faces[2*i+1+n]])];
                // todo: скопировал первую точку во все точки, которых нет в faces
                pShapes = bodiesFaces.map(bFaces => {
                    let [nFaces, nVertices] = normalizeShape(bFaces, args.vertices)
                    return new CANNON.ConvexPolyhedron({
                        vertices: [...nVertices.map(p => new CANNON.Vec3(...p))],
                        faces: nFaces
                    })
                });                    
            }

            // see shmykov-dev Algo, to build this one. Example: take many cubes, join them to a single shape, it takes them back
            if (args.complexStrategy == "ManyCubes")
            {
                let m = 12;
                let n = args.faces.length / m;
                let bodiesFaces = Array(n).keys().map(i => args.faces.slice(m*i, m*i+m))
                pShapes = bodiesFaces.map(bFaces => {
                    let [nFaces, nVertices] = normalizeShape(bFaces, args.vertices)
                    return new CANNON.ConvexPolyhedron({
                        vertices: [...nVertices.map(p => new CANNON.Vec3(...p))],
                        faces: nFaces
                    })
                });
            }
        } else {
            let pShape = new CANNON.ConvexPolyhedron({
                vertices: [...args.vertices.map(p => new CANNON.Vec3(...p))],
                faces: args.faces
            })
            pShapes = [pShape]
        }

        // Создаем представление многогранника на сцене
        const gVertices = new Float32Array(args.vertices.flatMap(v => v))
        const gIndices = new Uint16Array(args.faces.flatMap(fs => fs.flatMap(i => i)))
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(gVertices, 3))
        geometry.setIndex(new THREE.BufferAttribute(gIndices, 1))
        const material = args.meshMaterialFn ? args.meshMaterialFn(args.color) : getMeshWireMaterial(args.color);
        const mesh = new THREE.Mesh(geometry, material);

        super(args, pShapes, mesh)
    }
}