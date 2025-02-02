import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { pItemMaterial } from '../World/PhysicMaterials.js'
import { getMeshWireMaterial } from '../Scene/MeshMaterials.js'
import * as vfn from '../VecFuncs.js'

export class PObject {
    constructor(args, shapes, geometry) {
        args = {
            id: 'object',
            static: false,
            mass: 1,
            position: [0, 0, 0],
            quaternion: [0, 0, 0, 1],
            usePhysic: true,
            useView: true,
            useCollision: true,
            angularDamping: 0.5,
            pMaterial: pItemMaterial,
            debugBody: false,
            ...args
        }

        this.args = args
        this.id = args.id
        this.shapes = shapes
        this.geometry = geometry
    }

    getArgQ() {
        return Array.isArray(this.args.quaternion)
            ? new CANNON.Quaternion(...this.args.quaternion)
            : this.args.quaternion
    }

    getVcq(vcq) {
        return Array.isArray(vcq) 
            ? [vcq[0], vfn.sum(vcq[1], this.args.position), new CANNON.Quaternion().mult(vcq[2], this.getArgQ())]
            : [vcq, this.args.position, this.getArgQ()];
    }

    initView() {
        const args = this.args;
        const material = args.meshMaterialFn ? args.meshMaterialFn(args.color) : getMeshWireMaterial(args.color);
        const [g, gC, gQ] = this.getVcq(this.geometry);
        let mesh = new THREE.Mesh(g, material);       // Представление
        mesh.position.set(gC[0], gC[1], gC[2])          // Позиция
        mesh.quaternion.set(gQ.x, gQ.y, gQ.z, gQ.w)     // Поворот

        this.mesh = mesh;
        this.scene.add(this.mesh);
    }

    initPhysic() {
        const args = this.args
        const shapes = this.shapes
        const getVcq = this.getVcq.bind(this)

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
        this.bodies = [...this.shapes.map(shape => getBodyByShape(shape))];
        this.bodies.forEach(body => this.world.addBody(body));
        this.body = this.bodies[0]; // todo: many bodies physic support
    }

    initDebugMesh() {
        console.log(`Debug mesh for ${this.id} is not implemented`)
    }

    init() {
        this.world = this.pWorld.world;
        this.scene = this.pWorld.scene;

        // use physics bodies in the world
        if (this.args.usePhysic)
            this.initPhysic();

        // show mesh (view)
        if (this.args.useView) 
            this.initView()

        if (this.args.debugMesh)
            this.initDebugMesh()
    }

    get upFactor() {
        const q = this.body.quaternion
        const uY = CANNON.Vec3.UNIT_Y.clone()
        const quY = q.vmult(uY)
        const factor = quY.dot(CANNON.Vec3.UNIT_Y)
        return factor
    }

    get position() {
        const p = this.body.position
        return new THREE.Vector3(p.x, p.y, p.z)
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
