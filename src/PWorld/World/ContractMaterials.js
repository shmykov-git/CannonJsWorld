import * as CANNON from 'cannon-es';
import { pPolyhedronMaterial, pItemMaterial } from './PhysicMaterials.js'

// все Polyhedron одинакого взаимодействуют друг с другом
export const contactPolyhedronMaterial = new CANNON.ContactMaterial(pPolyhedronMaterial, pPolyhedronMaterial, {
    friction: 0.5, // Коэффициент трения
    restitution: 0.7, // Коэффициент упругости
});

// все Sphere одинакого взаимодействуют друг с другом
export const contactItemItemMaterial = new CANNON.ContactMaterial(pItemMaterial, pItemMaterial, {
    friction: 0.5, // Коэффициент трения
    restitution: 0.7, // Коэффициент упругости
});

// все Sphere одинакого взаимодействуют с Polyhedron
export const contactItemPolyhedronMaterial = new CANNON.ContactMaterial(pItemMaterial, pPolyhedronMaterial, {
    friction: 0.5, // Коэффициент трения
    restitution: 0.7, // Коэффициент упругости
});

export default [
    contactPolyhedronMaterial,
    contactItemItemMaterial,
    contactItemPolyhedronMaterial
];