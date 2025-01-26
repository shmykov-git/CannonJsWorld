import * as CANNON from 'cannon-es';

// физический материал для всех Polyhedron
export const pWallMaterial = new CANNON.Material("wall");

// физический материал для всех шаров сцены
export const pItemMaterial = new CANNON.Material("item");

export const pNoContactMaterial = new CANNON.Material('no_contact');


export default [
    pWallMaterial,
    pItemMaterial,
    pNoContactMaterial
]


