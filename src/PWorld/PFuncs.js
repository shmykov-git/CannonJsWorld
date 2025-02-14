import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Функция для получения направления камеры
export function getCameraDirection(camera) {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    return direction.normalize();
}

// Функция для задания силы вращения для ориентации в направлении камеры
export function alignObjectToCamera(body, camera, power = 500) {
    // Направление камеры
    const cameraDirection = getCameraDirection(camera);
    alignObjectToDirection(body, cameraDirection, power)
}

// Функция для задания силы вращения для ориентации в заданном направлении
export function alignObjectToDirection(body, direction, power = 500) {
    // Текущая ориентация объекта (локальная ось "вперед")
    const objectForward = new THREE.Vector3(0, 0, -1); // Зависит от начальной ориентации объекта
    const objectQuat = new THREE.Quaternion(
        body.quaternion.x,
        body.quaternion.y,
        body.quaternion.z,
        body.quaternion.w
    );
    objectForward.applyQuaternion(objectQuat);

    // Угол между направлением объекта и камеры
    const rotationAxis = new THREE.Vector3(); 
    rotationAxis.crossVectors(objectForward, direction);
    const angle = objectForward.angleTo(direction);

    // Применяем момент вращения
    const torque = new CANNON.Vec3(
        rotationAxis.x * angle,
        rotationAxis.y * angle,
        rotationAxis.z * angle
    ).scale(power);

    body.torque.set(torque.x, torque.y, torque.z);
}

