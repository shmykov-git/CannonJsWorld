import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as CANNON from 'cannon-es';
import contactMaterials from './World/ContractMaterials.js'
import lights from './Scene/Lights.js'

export class PWorld {
    constructor(args) {
        args = { ...{
            gravityPower: 9.82,
            worldRadius: 20,
            cameraPosition: [0, 0, 50],
            cameraLookAt: [0, 0, 0],
        }, ...args};

        this.args = args;
    }

    get(id) {
        return this.objects.find(o => o.id === id)
    }

    getAll(id) {
        return this.objects.filter(o => o.id === id)
    }

    init(objects) {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -this.args.gravityPower, 0); // Поумолчанию направлена вниз
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
        // Обновляем физику всех объектов
        this.world.step(1 / 60);

        // Рисуем объекты в соответствии с физикой
        this.objects.forEach(obj => obj.update());
        
        // Позволяем вращать сцену
        this.orbitControls.update()

        // Гравитация всегда направлена вниз к оси направления камеры
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
        const distance = body.position.length();
        if (distance < this.args.worldRadius) return;

        // Нормализуем вектор направления
        const scale = this.args.worldRadius / distance;
        body.position.x *= scale;
        body.position.y *= scale;
        body.position.z *= scale;
    }
}