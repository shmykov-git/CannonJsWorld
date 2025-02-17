import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PSphere } from '../PObjects.js'

export class PJumpSphere extends PSphere {
    constructor(args) {
        args = {
            jumpPower: 500, 
            ...args
        }
        super(args)
    }

    init() {
        super.init()

        this.canJamp = false;
        this.collideCount = 0;
        this.body.addEventListener("collide", event => {
            this.canJamp = true;
        });         
    }

    jump() {
        if (!this.canJamp) return;
        this.canJamp = false;

        const g = new THREE.Vector3();
        g.copy(this.world.gravity)
        const force = g.multiplyScalar(-this.args.jumpPower); // Направление и сила прыжка в обратном гравитации направлении
        this.body.applyForce(force); // Применяем силу к мячу
    }        
}