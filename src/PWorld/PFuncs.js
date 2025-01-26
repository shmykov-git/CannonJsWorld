import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { normalizeShape } from './ArrayFuncs';
import * as vfn from './VecFuncs'

export const Q1 = new CANNON.Quaternion(0, 0, 0, 1);

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
        const c = vfn.center(nVertices)
        const nCenterVertices = vfn.subA(nVertices, c)
        const shape = getConvexPolyhedronShape(nCenterVertices, nFaces);
        return [shape, c, Q1];
    });  
}

// todo: min, max?
export function getBoxShapesByFaces(vertices, bodiesFaces, rotate = false) {
    return bodiesFaces.map(bFaces => {
        const indices = [...new Set(bFaces.flatMap(bf => bf.flatMap(i => i)))]
        const vs = [...indices.map(i=>vertices[i])];
        const c = vfn.center(vs)
        const cvs = vfn.subA(vs, c)
        const [fi, i] = vfn.maxBy(cvs, v => vfn.len2(v))
        const xyzV = vfn.abs(cvs[i])
        const maxV = vfn.maxC(xyzV)
        let halfV = xyzV

        let q = new CANNON.Quaternion(0, 0, 0, 1);

        if (rotate) {
            const aa = vertices[bFaces[0][0]]
            const bb = vertices[bFaces[0][1]]
            const cc = vertices[bFaces[0][2]]
            const xAxx = vfn.normed(vfn.sub(aa, cc))
            const yAx = vfn.normed(vfn.sub(bb, cc))
            const zAx = vfn.normed(vfn.multV(xAxx, yAx))
            const xAx = vfn.multV(yAx, zAx)

            // const halfV = [vfn.len(vfn.sub(cc, bb))/2, vfn.len(vfn.sub(bb, aa))/2, 0.1]

            const xAxis = new THREE.Vector3(...xAx); // Вектор X
            const yAxis = new THREE.Vector3(...yAx); // Вектор Y
            const zAxis = new THREE.Vector3(...zAx); // Вектор Z

            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeBasis(xAxis, yAxis, zAxis);
            const quaternion = new THREE.Quaternion();
            quaternion.setFromRotationMatrix(rotationMatrix);
            q = new CANNON.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);

            const maxV = vfn.maxC(xyzV)
            halfV = [maxV, maxV, 0.1]
        }

        const shape = new CANNON.Box(new CANNON.Vec3(...halfV))
        return [shape, c, q];
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

