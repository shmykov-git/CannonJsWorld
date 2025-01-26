import * as CANNON from 'cannon-es';
import { pWallMaterial, pItemMaterial, pPlasticMaterial } from './PhysicMaterials.js'

// все Polyhedron одинакого взаимодействуют друг с другом
export const contactPolyhedronMaterial = new CANNON.ContactMaterial(pWallMaterial, pWallMaterial, {
    friction: 0.5, // Коэффициент трения
    restitution: 0.7, // Коэффициент упругости
});

// все Sphere одинакого взаимодействуют друг с другом
export const contactItemItemMaterial = new CANNON.ContactMaterial(pItemMaterial, pItemMaterial, {
    friction: 0.5, // Коэффициент трения
    restitution: 0.7, // Коэффициент упругости
});

// все Sphere одинакого взаимодействуют с Polyhedron
export const contactItemWallMaterial = new CANNON.ContactMaterial(pItemMaterial, pWallMaterial, {
    friction: 0.5, // Коэффициент трения
    restitution: 0.7, // Коэффициент упругости
});

// пластик с землей или стеной
export const contactPlasticWallMaterial = new CANNON.ContactMaterial(pPlasticMaterial, pWallMaterial, {
    friction: 0.4, // Коэффициент трения
    restitution: 0.7, // Коэффициент упругости
});

// пластик с пластиком
export const contactPlasticPlasticMaterial = new CANNON.ContactMaterial(pPlasticMaterial, pPlasticMaterial, {
    friction: 0.001, // Коэффициент трения
    restitution: 0.9, // Коэффициент упругости
});

export default [
    contactPlasticWallMaterial,
    contactPlasticPlasticMaterial,
    contactPolyhedronMaterial,
    contactItemItemMaterial,
    contactItemWallMaterial
];