import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { pItemMaterial } from '../World/PhysicMaterials.js'
import { getMeshWireMaterial } from '../Scene/MeshMaterials.js'
import * as vfn from '../VecFuncs.js'

export class PObject {
    constructor(args, shapes, geometry, debugMesh = undefined) {
        args = {
            id: 'object',
            static: false,
            mass: 1,
            position: [0, 0, 0],
            usePhysic: true,
            useCollision: true,
            angularDamping: 0.5,
            pMaterial: pItemMaterial,
            debugBody: false,
            ...args
        }

        this.args = args
        this.id = args.id

        const getVcq = vcq => Array.isArray(vcq) 
            ? [vcq[0], vfn.sum(vcq[1], args.position), vcq[2]]
            : [vcq, args.position, new CANNON.Quaternion(0, 0, 0, 1)];
            
        function getBodyByShape(shape) {
            const [s, sC, sQ] = getVcq(shape);

            const body = new CANNON.Body({
                mass: (args.static ? 0 : args.mass / shapes.length),
                type: (args.static ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC),
                shape: s,                           // Форма
                position: new CANNON.Vec3(...sC),   // Позиция
                quaternion: sQ                      // Поворот
            })

            if (!args.useCollision)
                body.collisionFilterMask = 0;

            body.material = args.pMaterial;
            body.angularDamping = args.angularDamping; // Damping to reduce spinning over time

            return body
        }

        // physics body
        this.shapes = shapes
        this.bodies = [...shapes.map(shape => getBodyByShape(shape))];
        this.body = this.bodies[0];
        
        // view mesh
        const material = args.meshMaterialFn ? args.meshMaterialFn(args.color) : getMeshWireMaterial(args.color);
        const [g, gC, gQ] = getVcq(geometry);
        let mesh = new THREE.Mesh(g, material);       // Представление
        mesh.position.set(gC[0], gC[1], gC[2])          // Позиция
        mesh.quaternion.set(gQ.x, gQ.y, gQ.z, gQ.w)     // Поворот

        if (debugMesh) {
            const group = new THREE.Group()
            group.add(mesh)
            group.add(debugMesh)
            mesh = group
        }

        this.mesh = mesh;
    }

    init(pWorld) {
        this.pWorld = pWorld;
        this.world = pWorld.world;
        this.scene = pWorld.scene;

        // use physics bodies in the world
        if (this.args.usePhysic)
            this.bodies.forEach(body => this.world.addBody(body));

        // show mesh (view)
        this.scene.add(this.mesh);
    }

    update() {
        if (!this.args.usePhysic || this.args.static || !this.body) // todo: single body physic only
            return;
        
        if (this.pWorld.args.useWorldRadius && this.body)
            this.pWorld.enforceWorldRadius(this.body);

        // physics position and rotation
        let p = this.body.position;
        let q = this.body.quaternion;

        // apply world (physics) state to view state (scene meshe)
        this.mesh.position.set(p.x, p.y, p.z);
        this.mesh.quaternion.set(q.x, q.y, q.z, q.w);
    }            
}
