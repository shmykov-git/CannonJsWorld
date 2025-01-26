import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
import contactMaterials from './World/ContractMaterials.js'
import lights from './Scene/Lights.js'
import { PPlane } from './PObjects/PPlane.js'
import * as vfn from './VecFuncs.js'

export class PWorld {
    constructor(args) {
        // default PWorld args
        args = {
            gravity: [0, -9.82, 0],
            worldRadius: 100,
            cameraPosition: [0, 0, 50],
            cameraLookAt: [0, 0, 0],
            changeGravityByCamera: false,
            useOrbitControlForCamera: true,
            useWorldRadius: true,
            worldRadiusStrategy: "FixPosition",
            worldRadiusFriction: 0.5,
            useGravity: true,
            useGround: false,
            groundSize: [20, 20],
            groundColor: 0x008800,
            ...args
        };
        args.gravityPower = vfn.len(args.gravity)
        args.worldRadiusSquared = args.worldRadius * args.worldRadius

        this.args = args;
        this.clock = new THREE.Clock();
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
                size: this.args.groundSize,
                color: this.args.groundColor
            });
            objects = [ground, ...objects]
        }

        if (this.args.useGravity)
            this.world.gravity.set(this.args.gravity[0], this.args.gravity[1], this.args.gravity[2]);

        this.objects = objects;

        // Set up the scene, camera, and renderer
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.querySelectorAll('canvas').forEach(canvas => canvas.outerHTML = '')
        document.body.appendChild(this.renderer.domElement);
        
        lights.forEach(light => this.scene.add(light));
        contactMaterials.forEach(cM => this.world.addContactMaterial(cM));        
        objects.forEach(o => o.init(this));

        // Set camera position        
        this.camera.position.x = this.args.cameraPosition[0];
        this.camera.position.y = this.args.cameraPosition[1];
        this.camera.position.z = this.args.cameraPosition[2];
        this.camera.lookAt(this.args.cameraLookAt[0], this.args.cameraLookAt[1], this.args.cameraLookAt[2]);

        // возможность вращать сцену
        const orbitControls = new OrbitControls(this.camera, this.renderer.domElement)
        orbitControls.enableDamping = true
        orbitControls.dampingFactor = 0.1
        orbitControls.screenSpacePanning = false
        orbitControls.minDistance = 1
        orbitControls.maxDistance = 100
        this.orbitControls = orbitControls;

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
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

        // Гравитация всегда направлена вниз к оси направления камеры
        if (this.args.changeGravityByCamera && this.args.useGravity)
            this.updateGravity()

        // Обновляем визуализацию сцены
        this.renderer.render(this.scene, this.camera);
    }

    getOrtDown(a, b) {
        const ab = new THREE.Vector3();
        ab.copy(b).cross(a);
        const aba = new THREE.Vector3();
        aba.copy(ab).cross(a);
        return aba.normalize();
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
            // Отразить скорость относительно нормали
            const dotProduct = body.velocity.dot(normal);

            if (dotProduct > 0) {
                const reflectedVelocity = body.velocity.vsub(normal.scale(2 * dotProduct));
                body.velocity.copy(reflectedVelocity);
            }

            // Дополнительно: можно немного уменьшить скорость для эффекта потери энергии
            body.velocity.scale(friction);
            body.angularVelocity.scale(-friction);
        }

        switch (this.args.worldRadiusStrategy) {
            case "FixPosition":
                fixPosition()
                break;
            case "RejectSpeed":
                rejectSpeed()
                break;
            default:
                fixPosition()
                break;
        }
    }
}