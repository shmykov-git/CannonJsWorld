// vertices: array of points [[x1,y1,z1], [x2,y2,z2], ...]
// faces: array of shape triangles [[0, 1, 2], [0, 1, 3], ...], each triangle is pointed to array of vertices, so it is three point of a plain and this is a shown triangle in the scene
//        face has a normal, so [0, 1, 2] and [0, 2, 1] is the same triangle, but it will be shown in the scene just by one side of it, that is very important to be shown and for physic collisions
//        so, each object has back side - that is a body of the shape and outside - that is empty space it is located in


// Array(n).keys().map(i => i + start)
export function* range(start, end) {
    for (let i = start; i < end; i += 1) 
        yield i;
}

function* rN(end) { for (let i = 0; i < end; i++) yield i }

const doCi = (v, opi) => [...rN(v.length).map(i => opi(v[i]))]
const doVi = (v, x, opi) => [...rN(v.length).map(i => opi(v[i], x[i]))]

const dooVi = (vs, x, opi) => vs.map( v => doVi(v, x, opi) )
const dooCi = (vs, opi) => vs.map( v => doCi(v, opi) )


export const scale = (v, x) => doVi(v, x, (a, b) => a * b)
export const add = (v, x) => doVi(v, x, (a, b) => a + b)
export const sum = (v, x) => doVi(v, x, (a, b) => a + b)
export const sub = (v, x) => doVi(v, x, (a, b) => a - b)
export const div = (v, c) => doCi(v, a => a / c)

export const scaleA = (vs, x) => dooVi(vs, x, (a, b) => a * b)
export const addA = (vs, x) => dooVi(vs, x, (a, b) => a + b)
export const subA = (vs, x) => dooVi(vs, x, (a, b) => a - b)
export const divA = (vs, c) => dooCi(vs, a => a / c)

export function sumA(vs) {
    let sum = [0, 0, 0]
    vs.forEach(v => { sum[0] += v[0]; sum[1] += v[1]; sum[2] += v[2]; })
    return sum;
}

export function center(vs) { return div(sumA(vs), vs.length); }

// takes part of vertices from big shape and create new shape with correct faces from it
export function normalizeShape(vertices0, faces0) {
    let faces = [...new Set(faces0.flatMap(f => f))].sort((a, b) => a - b)
    let nVertices = [...faces.map(i => vertices0[i])]
    let bi = Object.fromEntries(faces.map((i, j) => [i, j]));
    let nFaces = [...faces0.map(f => [bi[f[0]], bi[f[1]], bi[f[2]]])]
    return [nVertices, nFaces]
}

// that is inverse inside shape space and outside shape space. it will affect as scene as physic
export function inverseFaces(faces) {
    return faces.map(f => [f[0], f[2], f[1]])
}

export function multPoints(mult, points) {
    return points.map(p => [mult * p[0], mult * p[1], mult * p[2]])
}

export function addPoints(v, points) {
    return points.map(p => [v + p[0], v + p[1], v + p[2]])
}