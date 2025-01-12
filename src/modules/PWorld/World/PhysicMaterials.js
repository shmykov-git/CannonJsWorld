import * as CANNON from 'cannon-es';

// физический материал для всех Polyhedron
export const pPolyhedronMaterial = new CANNON.Material('Polyhedron');

// физический материал для всех шаров сцены
export const pItemMaterial = new CANNON.Material('sphere');

export default [
    pPolyhedronMaterial,
    pItemMaterial
]


