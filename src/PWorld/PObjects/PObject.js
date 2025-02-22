import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { pItemMaterial } from '../World/PhysicMaterials.js'
import { getMeshWireMaterial } from '../Scene/MeshMaterials.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
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
            useModel: false,
            useCollision: true,
            useSelection: true,
            angularDamping: 0.5,
            pMaterial: pItemMaterial,
            debugBody: false,
            ...args,

            model: {
                url: "santa.glb",
                scale: [0.9, 0.9, 0.9],
                position: [0, -1.2, 0],
                color: undefined,
                ...args.model
            },
            selection: {
                type: "byView",
                onSelect: obj => {},
                ...args.selection
            }
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

    initModel(model) {
        const modelGroup = new THREE.Group()

        model.scale.set(...this.args.model.scale)
        model.position.set(...this.args.model.position)

        model.traverse((object) => {
            if (object.isMesh) {
                if (this.args.model.color)
                    object.material.color.set(this.args.model.color)
            }
        })
                
        modelGroup.add(model)
        this.model = modelGroup
        this.scene.add(this.model)
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

    initSelection() {
        this.selection = {
            raycaster: new THREE.Raycaster(),
            mouse: new THREE.Vector2()
        }

        window.addEventListener('click', event => this.onSelect(event));
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

        // show mesh (model)
        if (this.args.useModel) {
            this.loadModel()
        } 

        // allow the object to be selected
        if (this.args.useSelection) {
            this.initSelection()
        }

        if (this.args.debugMesh)
            this.initDebugMesh()
    }

    loadModel() {
        let url = this.args.model.url
        if (!url.startsWith('/')) url = '/' + url
        if (!url.startsWith('/models')) url = '/models' + url

        const loader = new GLTFLoader();
        loader.load(
            url,
            (gltf) => {
                this.initModel(gltf.scene)
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% загружено');
            },
            (error) => {
                console.error('Ошибка при загрузке модели:', error);
            }
        )
    }

    onSelect(clickEvent) {
        this.selection.mouse.x = (clickEvent.clientX / window.innerWidth) * 2 - 1;
        this.selection.mouse.y = -(clickEvent.clientY / window.innerHeight) * 2 + 1;
        this.selection.raycaster.setFromCamera(this.selection.mouse, this.pWorld.camera);

        if (this.args.selection.type == "byView") {
            const intersects = this.selection.raycaster.intersectObject(this.mesh);
            
            if (intersects.length > 0 && this.args.selection.onSelect) {
                this.args.selection.onSelect(this)
            }
        }    
    }

    hideView() {
        if (this.args.useView) {
            this.args.useView = false
            this.scene.remove(this.mesh);
        }
    }

    showView() {
        if (!this.args.useView) {
            this.args.useView = true
            this.scene.add(this.mesh);
        }
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

        let p = this.body.position;
        let q = this.body.quaternion;

        // move and rotate view by the phisics model
        if (this.args.useView) {
            this.mesh.position.set(p.x, p.y, p.z);
            this.mesh.quaternion.set(q.x, q.y, q.z, q.w);
        }

        // move and rotate view by the phisics model
        if (this.args.useModel && this.model) {
            this.model.position.set
            this.model.position.set(p.x, p.y, p.z);
            this.model.quaternion.set(q.x, q.y, q.z, q.w);
        }
    }            
}
