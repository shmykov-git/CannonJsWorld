import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { pItemMaterial } from '../World/PhysicMaterials.js'
import { getMeshWireMaterial } from '../Scene/MeshMaterials.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as vfn from '../VecFuncs.js'
import { decode } from "@msgpack/msgpack";

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

            view: {
                position: [0, 0, 0],
                ...args.view
            },
            model: {
                url: "santa.glb",
                centered: true,
                normed: true,
                scale: [1, 1, 1],
                position: [0, 0, 0],
                color: undefined,
                materials: undefined,
                useAnimate: false,
                ...args.model,

                animate: {
                    slowMotion: 2,
                    ...args.model?.animate
                }
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
        let mesh = new THREE.Mesh(g, material);                 // Представление
        const meshPos = vfn.sum(gC, this.args.view.position)
        mesh.position.set(meshPos[0], meshPos[1], meshPos[2])   // Позиция
        mesh.quaternion.set(gQ.x, gQ.y, gQ.z, gQ.w)             // Поворот

        this.mesh = mesh;
        this.scene.add(this.mesh);
    }

    initModel(model) {
        const args = this.args.model

        if (args.centered) {
            const box = new THREE.Box3().setFromObject(model, true);
            const center = new THREE.Vector3();
            box.getCenter(center);
            if (!isNaN(center.x) && !isNaN(center.y) && !isNaN(center.z))
                model.position.sub(center);
        }

        if (args.normed) {
            const box = new THREE.Box3().setFromObject(model, true);
            const size = new THREE.Vector3();
            box.getSize(size);
            const maxSize = Math.max(size.x, size.y, size.z);
            const scale = 1 / maxSize;  // Приводим наибольшую сторону к 1
            if (!isNaN(scale))
                model.scale.set(scale, scale, scale);
        }

        model.scale.x *= args.scale[0]
        model.scale.y *= args.scale[1]
        model.scale.z *= args.scale[2]
        model.position.x += args.position[0]
        model.position.y += args.position[1]
        model.position.z += args.position[2]

        let meshI = 0
        model.traverse((mesh) => {
            if (mesh.isMesh) {
                if (args.materials) {
                    const material = args.materials[meshI % args.materials.length]
                    if (material) mesh.material = material
                    else if (args.color) mesh.material.color.set(args.color)
                } else if (args.color)
                    mesh.material.color.set(args.color)
                meshI++
            }
        })
                
        // remove old model
        if (this.model) this.scene.remove(this.model)
        
        const modelGroup = new THREE.Group()
        modelGroup.add(model)
        this.model = modelGroup
        this.scene.add(this.model)

        if (args.useAnimate) {
            this.loadModelAnimate()
        }
    }

    initAnimate(animate) {
        const model = this.model.children[0]       
        let isValid = animate["meshes"].length == model.children.length

        if (!isValid) {
            console.log("Invalid animate mesh count")
            return
        }

        for (const [i, mesh] of model.children.entries()) {    
            const meshAnimate = animate["meshes"][i]
            const points0 = new Float32Array(meshAnimate["points0"])
            const index = new Uint16Array(meshAnimate["index"])
            const links = meshAnimate["links"]
            const moves0 = meshAnimate["moves"][0]
            const indexRemoves = meshAnimate["indexRemoves"]
            meshAnimate.hasIndexRemoves = indexRemoves && indexRemoves.reduce((acc, rm) => acc || rm.length > 0, false)

            if (moves0.length > 0) {
                if (links.length == 0) {
                    isValid &&= moves0.length == points0.length
                } else {
                    const movesCount = 3 * links.reduce((acc, ms) => acc + ms.length, 0)
                    isValid &&= (movesCount == points0.length)    
                }
            }

            mesh.geometry.setIndex(new THREE.BufferAttribute(index, 1));
            mesh.geometry.setAttribute('position', new THREE.BufferAttribute(points0, 3));
            // mesh.geometry.computeBoundingBox();
            // mesh.geometry.computeBoundingSphere();
        }

        if (!isValid) {
            console.log("Invalid animate mesh struct")
            return
        }

        animate.isActive = false
        animate.frameIndex = 0
        animate.frameCount = animate["meshes"][0]["moves"].length
        this.modelAnimate = animate
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

    getModelUrl() {
        let url = this.args.model.url
        if (!url) return

        if (!url.startsWith('/')) url = '/' + url
        if (!url.startsWith('/models')) url = '/models' + url
        return url
    }

    getModelAnimateUrl() {
        const modelUrl = this.getModelUrl()
        if (!modelUrl) return

        return modelUrl.replace(/\.glb$/, ".animate");
    }

    loadModel(onLoad) {
        const modelUrl = this.getModelUrl()
        if (!modelUrl) return

        const loader = new GLTFLoader();
        loader.load(
            modelUrl,
            (gltf) => {
                this.initModel(gltf.scene)
                if (onLoad) onLoad(this.model)
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% загружено');
            },
            (error) => {
                console.error('Ошибка при загрузке модели:', error);
            }
        )
    }

    async loadModelAnimate() {
        const animateUrl = this.getModelAnimateUrl()

        try {
            const response = await fetch(animateUrl);
        
            if (!response.ok) {
                throw new Error(`Ошибка загрузки анимации: ${response.statusText}`);
            }
        
            const arrayBuffer = await response.arrayBuffer();
            const animate = decode(new Uint8Array(arrayBuffer));
        
            this.initAnimate(animate)
        } catch (error) {
            console.error("Ошибка при загрузке или декодировании:", error);
            return null;
        }
    }

    onSelect(clickEvent) {
        if (!this.args.useSelection) return

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

            if (this.args.model.useAnimate && this.modelAnimate?.isActive) {
                this.updateAnimate()
            }
        }
    }
    
    startAnimate() {
        this.modelAnimate.isActive = true
    }

    stopAnimate() {
        this.modelAnimate.isActive = false
    }

    updateAnimate() {
        const slowMotion = this.args.model.animate.slowMotion
        const updateCount = this.modelAnimate.updateCount ?? 0
        this.modelAnimate.updateCount = (updateCount + 1) % slowMotion
        
        if (updateCount % slowMotion != 0)
            return;
    
        const frameCount = this.modelAnimate.frameCount
        const frameIndex = this.modelAnimate.frameIndex
        const model = this.model.children[0]

        for (const [iMesh, mesh] of model.children.entries()) {
            const meshAnimate = this.modelAnimate["meshes"][iMesh]
            const moves = meshAnimate["moves"]
            if (moves[frameIndex].length == 0) continue

            const links = meshAnimate["links"]
            const points0 = meshAnimate["points0"]
            const points = new Float32Array(points0)  

            if (links.length == 0) {
                for (const [i, x] of points.entries()) {
                    points[i] = x + moves[frameIndex][i]
                }
            } else {
                for (const [linkI, ps] of links.entries()) 
                for (const pI of ps) {
                    points[3*pI] += moves[frameIndex][3*linkI]
                    points[3*pI + 1] += moves[frameIndex][3*linkI + 1]
                    points[3*pI + 2] += moves[frameIndex][3*linkI + 2]
                }
            }      

            if (meshAnimate.hasIndexRemoves) {
                if (iMesh == 0) {
                    const index = new Uint16Array(meshAnimate["index"])
                    mesh.geometry.setIndex(new THREE.BufferAttribute(index, 1))
                } else {
                    const indexRemoves = meshAnimate["indexRemoves"]
                    const excludeIndexes = new Set(indexRemoves[frameIndex])
                    if (excludeIndexes.size > 0) {
                        const newIndex = new Uint16Array(mesh.geometry.index.array.filter((_, i) => !excludeIndexes.has((i / 3) | 0)))
                        mesh.geometry.setIndex(new THREE.BufferAttribute(newIndex, 1))
                    }
                }
            }
            
            mesh.geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
            // mesh.geometry.computeBoundingBox();
            // mesh.geometry.computeBoundingSphere();
            
            // if (mesh.geometry.attributes.normal) 
            //     mesh.geometry.deleteAttribute('normal');              
            
            // mesh.geometry.computeVertexNormals();
        }

        this.modelAnimate.frameIndex = (frameIndex + 1) % frameCount        
    }     
}
