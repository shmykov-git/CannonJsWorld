import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PBox } from '../PObjects'
import { pPlasticMaterial } from '../World/PhysicMaterials'

export class Composer {
    constructor(args) {
        args = {
            ...args
        }
        this.args = args
    }

    getObjects() {
        throw new Error("not implemented")
    }
}

export class BoxComposer extends Composer {
    constructor(args) {
        args = {
            pMaterial: pPlasticMaterial,
            ...args
        }
        super(args)
    }

    getObjects() {
        const defaultColor = this.args.color
        const pMaterial = this.args.pMaterial

        return this.args.data.map(item => {
            const [size, center, quaternion] = item

            return new PBox({
                size: size,                
                position: center,
                quaternion: quaternion,
                color: defaultColor,
                pMaterial: pMaterial
            })
        })
    }
}

