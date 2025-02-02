import * as CANNON from 'cannon-es';

// физический материал для всех Polyhedron
export const pWallMaterial = new CANNON.Material("wall");

// физический материал для всех шаров сцены
export const pItemMaterial = new CANNON.Material("item");

// что-то из пластика
export const pPlasticMaterial = new CANNON.Material("plastic");

export const pNoContactMaterial = new CANNON.Material('no_contact');


export default [
    pPlasticMaterial,
    pWallMaterial,
    pItemMaterial,
    pNoContactMaterial
]


