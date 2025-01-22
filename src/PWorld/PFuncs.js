import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { normalizeShape, center, add, sub } from './ArrayFuncs';

export function getConvexPolyhedronShape(vertices, faces) {
    return new CANNON.ConvexPolyhedron({
        vertices: [...vertices.map(p => new CANNON.Vec3(...p))],
        faces: faces
    })
}

export function getTrimeshShape(vertices, faces) {
    var vs = [...vertices.flatMap(v => v)];
    var ins = [...faces.flatMap(f => f)];

    return new CANNON.Trimesh(vs, ins);
}

// bodiesFaces = [[[0,1,2],...], [[0,1,3],...]] 
export function getPolyhedronShapesByFaces(vertices, bodiesFaces) {
    return bodiesFaces.map(bFaces => {
        const [nVertices, nFaces] = normalizeShape(vertices, bFaces)
        const c = center(nVertices)
        const nCenterVertices = sub(nVertices, c)
        const body = getConvexPolyhedronShape(nCenterVertices, nFaces);
        return [body, c];
    });  
}

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

