// vertices: array of points [[x1,y1,z1], [x2,y2,z2], ...]
// faces: array of shape triangles [[0, 1, 2], [0, 1, 3], ...], each triangle is pointed to array of vertices, so it is three point of a plain and this is a shown triangle in the scene
//        face has a normal, so [0, 1, 2] and [0, 2, 1] is the same triangle, but it will be shown in the scene just by one side of it, that is very important to be shown and for physic collisions
//        so, each object has back side - that is a body of the shape and outside - that is empty space it is located in

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