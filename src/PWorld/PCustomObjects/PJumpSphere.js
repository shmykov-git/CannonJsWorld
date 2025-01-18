import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PShere } from '../PObjects.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class PJumpSphere extends PShere {
    constructor(args) {
        args = {
            jumpPower: 500, 
            ...args
        }

        super(args)

        this.canJamp = false;
        this.collideCount = 0;
        this.body.addEventListener("collide", event => {
            this.canJamp = true;
        });         

        if (args.modelPath) {
            this.loadModel().then(model =>{

            })
        } 
    }

    jump() {
        if (!this.canJamp) return;
        this.canJamp = false;

        const g = new THREE.Vector3();
        g.copy(this.world.gravity)
        const force = g.multiplyScalar(-this.args.jumpPower); // Направление и сила прыжка в обратном гравитации направлении
        this.body.applyForce(force); // Применяем силу к мячу
    }    
    
    async loadModel() {
        // Загрузчик модели
        let model = null;
        const loader = new GLTFLoader();
        await loader.load(
            this.args.modelPath, // Путь к модели
            (gltf) => {
                model = gltf.scene; // Достаем сцену из модели
                model.scale.set(0.5, 0.5, 0.5); // Масштабируем модель, если она слишком большая
                model.position.set(0, 0, 0); // Устанавливаем позицию модели
                // scene.add(model); // Добавляем модель в сцену
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% загружено'); // Прогресс загрузки
            },
            (error) => {
                console.error('Ошибка при загрузке модели:', error);
            }
        );
        return model;
    }
}