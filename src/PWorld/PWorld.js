import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
import contactMaterials from './World/ContractMaterials.js'
import lights from './Scene/Lights.js'
import { PPlane } from './PObjects/PPlane.js'
import * as vfn from './VecFuncs.js'
import { pWallMaterial } from './World/PhysicMaterials.js'
import { getPlaneMaterial, getMeshTransparentMaterial } from './Scene/MeshMaterials.js'
import { cameraPosition } from 'three/tsl';

export class PWorld {
    constructor(args) {
        // default PWorld args
        args = {
            gravity: [0, -9.82, 0],
            worldRadius: 30,
            cameraPosition: [10, 20, 30],
            cameraLookAt: [0, 0, 0],
            changeGravityByCamera: false,
            useOrbitControlForCamera: true,
            orbitControlDistance: [1, 100],
            useWorldRadius: true,
            worldRadiusStrategy: "RejectSpeed",
            worldRadiusFriction: 0.5,
            useGravity: true,
            useGround: true,
            lights: lights,
            backgroundColor: 0x202020,
            ...args,

            ground: {
                size: [30, 30, 0.5],
                position: [0, 0, 0],
                color: 0x008800,
                type: "box",
                pMaterial: pWallMaterial,
                meshMaterialFn: getMeshTransparentMaterial,

                view: {
                    position: [0, 0, 0],
                    ...args.ground?.view
                },
                ...args.ground
            }
        };
        args.gravityPower = vfn.len(args.gravity)
        args.worldRadiusSquared = args.worldRadius * args.worldRadius

        this.args = args;
        this.clock = new THREE.Clock();
    }

    attachCamera(attachArgs) {
        attachArgs = {
            object: undefined,
            targetPositionFn: undefined,
            offset: new THREE.Vector3(0, 5, -10),
            distance: [10, 30],
            strategy: "SimpleFollowing",
            acceleration: 0.02,
            ...attachArgs
        }

        if (!attachArgs.targetPositionFn) {
            if (!attachArgs.object) {
                throw new Error("Unknown target position. Set object or targetPositionFn")
            }

            attachArgs.targetPositionFn = () => attachArgs.object.position
        }

        this.attachArgs = attachArgs
    }
    
    detachCamera() {
        this.attachArgs = undefined
    }

    get(id) {
        return this.objects.find(o => o.id === id)
    }

    getAll(id) {
        return this.objects.filter(o => o.id === id)
    }

    getInstancesOf(type) {
        return this.objects.filter(o => o instanceof type)
    }

    init(objects) {
        this.world = new CANNON.World();

        if (this.args.useGround) {
            const ground = new PPlane({
                id: "ground",
                static: true,
                size: this.args.ground.size,
                position: this.args.ground.position,
                color: this.args.ground.color,
                type: this.args.ground.type,
                view: this.args.ground.view,
                meshMaterialFn: this.args.ground.meshMaterialFn
            });
            objects = [...objects, ground]
        }

        if (this.args.useGravity)
            this.world.gravity.set(this.args.gravity[0], this.args.gravity[1], this.args.gravity[2]);

        this.objects = objects;

        // Set up the scene, camera, and renderer
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.args.backgroundColor);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.querySelectorAll('canvas').forEach(canvas => canvas.outerHTML = '')
        document.body.appendChild(this.renderer.domElement);
        
        this.args.lights.forEach(light => this.scene.add(light));
        contactMaterials.forEach(cM => this.world.addContactMaterial(cM));        
        objects.forEach(o => {
            o.pWorld = this
            o.init()
        });

        this.setCameraPosition(this.args.cameraPosition, this.args.cameraLookAt)

        // возможность вращать сцену
        const orbitControls = new OrbitControls(this.camera, this.renderer.domElement)
        orbitControls.enableDamping = true
        orbitControls.dampingFactor = 0.1
        orbitControls.screenSpacePanning = false
        orbitControls.minDistance = this.args.orbitControlDistance[0]
        orbitControls.maxDistance = this.args.orbitControlDistance[1]
        this.orbitControls = orbitControls;

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    getOrtDown(a, b) {
        const ab = new THREE.Vector3();
        ab.copy(b).cross(a);
        const aba = new THREE.Vector3();
        aba.copy(ab).cross(a);
        return aba.normalize();
    }
    
    async loadPublicJson() {
        const response = await fetch('/public.json');
        const publicJson = await response.json();        
        return publicJson
    }
    // updateCameraUp() {
    //     const direction = new THREE.Vector3();
    //     camera.getWorldDirection(direction); // Получаем направление камеры
    //     const up = this.getOrtDown(direction, camera.up).multiplyScalar(-1)
    //     camera.up.set(up.x, up.y, up.z)
    // }
    
    updateGravity() {
        const direction = new THREE.Vector3();
        this.camera.getWorldDirection(direction); // Получаем направление камеры
        const gravity = this.getOrtDown(direction, this.camera.up).multiplyScalar(this.args.gravityPower)
        this.world.gravity.set(gravity.x, gravity.y, gravity.z)
    }

    // Функция для ограничения радиуса
    enforceWorldRadius(body) {
        const distanceSquared = body.position.lengthSquared();
        if (distanceSquared < this.args.worldRadiusSquared) return;

        const worldRadius = this.args.worldRadius
        const friction = this.args.worldRadiusFriction

        function fixPosition() { 
            const scale = worldRadius / Math.sqrt(distanceSquared);
            body.position.x *= scale;
            body.position.y *= scale;
            body.position.z *= scale;
        }

        function rejectSpeed() {
            const normal = body.position.unit();
            const dotProduct = body.velocity.dot(normal);

            if (dotProduct > 0) {
                const reflectedVelocity = body.velocity.vsub(normal.scale(2 * dotProduct));
                body.velocity.copy(reflectedVelocity);
            } else {
                body.velocity.scale(friction);
            }

            body.angularVelocity.scale(friction);
        }

        switch (this.args.worldRadiusStrategy) {
            case "FixPosition":
                fixPosition()
                break;
            case "RejectSpeed":
                rejectSpeed()
                break;
            default:
                rejectSpeed()
                break;
        }
    }

    setCameraPosition(position, lookAt = undefined) {
        this.camera.position.x = position[0];
        this.camera.position.y = position[1];
        this.camera.position.z = position[2];
        
        if (lookAt) {
            this.cameraLookAt = new THREE.Vector3(...lookAt)

            if (this.args.useOrbitControlForCamera && this.orbitControls)
                this.orbitControls.target.copy(this.cameraLookAt);
            else
                this.camera.lookAt(this.cameraLookAt)
        }
    }

    updateCameraPosition(cameraPosition) {
        this.camera.position.lerp(cameraPosition, this.attachArgs.acceleration)
    }

    updateCameraLookAt() {
        const targetPosition = this.attachArgs.targetPositionFn()
        this.cameraLookAt.lerp(targetPosition, this.attachArgs.acceleration)

        if (this.args.useOrbitControlForCamera)
            this.orbitControls.target.copy(this.cameraLookAt);
        else
            this.camera.lookAt(this.cameraLookAt)
    }

    updateCameraOffsetFollowing() {
        const offsetPosition = this.attachArgs.targetPositionFn().clone().add(this.attachArgs.offset)
        this.updateCameraPosition(offsetPosition)
        this.updateCameraLookAt()
    }

    updateCameraDistanceFollowing() {
        const [min, max] = this.attachArgs.distance
        const direction = this.cameraLookAt.clone().sub(this.camera.position)
        const dir2 = direction.lengthSq()
        let cameraPosition

        if (dir2 < min*min)
            cameraPosition = this.cameraLookAt.clone().add(direction.multiplyScalar(-min/Math.sqrt(dir2)))

        if (dir2 > max*max)
            cameraPosition = this.cameraLookAt.clone().add(direction.multiplyScalar(-max/Math.sqrt(dir2)))

        if (cameraPosition)
            this.updateCameraPosition(cameraPosition)

        this.updateCameraLookAt()
    }

    update() {
        const deltaTime = this.clock.getDelta(); // Time step
    
        // Обновляем физику всех объектов
        this.world.step(1 / 60, deltaTime, 3);

        // Рисуем объекты в соответствии с физикой
        this.objects.forEach(obj => obj.update());
        
        // Позволяем вращать сцену
        if (this.args.useOrbitControlForCamera)
            this.orbitControls.update()
        
        if (this.attachArgs) {
            switch (this.attachArgs.strategy) {
                case "SimpleFollowing":
                    this.updateCameraLookAt(this.attachArgs.object.position)
                    break
                case "DistanceFollowing":
                    this.updateCameraDistanceFollowing()
                    break
                case "OffsetFollowing":
                    this.updateCameraOffsetFollowing()
                    break
                default:
                    this.updateCameraSimpleFollowing()
                    break
            }
        }

        // Гравитация всегда направлена вниз к оси направления камеры
        if (this.args.changeGravityByCamera && this.args.useGravity)
            this.updateGravity()

        // Обновляем визуализацию сцены
        this.renderer.render(this.scene, this.camera);
    }
}