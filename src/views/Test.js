// Убедитесь, что у вас подключена three.js и GLTFLoader
// Например, через npm: npm install three three/examples/jsm/loaders/GLTFLoader

// не работает из коробки, не знаю что делать

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Основные элементы сцены
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Добавление источника света
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

const modelPath = '../models/santa_model.glb'

// Загрузка модели с помощью GLTFLoader
const loader = new GLTFLoader();
loader.load(
    modelPath,
    (gltf) => {
        // Успешная загрузка модели
        const model = gltf.scene;
        scene.add(model);

        // Настройка позиции и масштаба модели
        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);
    },
    (xhr) => {
        // Обновление прогресса загрузки
        console.log(`Загрузка: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
    },
    (error) => {
        // Обработка ошибок
        console.error('Ошибка при загрузке модели:', error);
    }
);

// Позиция камеры
camera.position.z = 5;

// Анимация
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Изменение размера при ресайзе окна
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
