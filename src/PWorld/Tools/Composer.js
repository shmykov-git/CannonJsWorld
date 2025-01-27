import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PBox } from '../PObjects'
import { pPlasticMaterial } from '../World/PhysicMaterials'
import * as vfn from '../VecFuncs'

export class Composer {
    constructor(args) {
        args = {
            position: [0, 0, 0],
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
        const pos = this.args.position
        const sum = vfn.sum

        function getObj(item) {
            const [size, center, quaternion] = item

            return new PBox({
                size: size,                
                position: sum(center, pos),
                quaternion: quaternion,
                color: defaultColor,
                pMaterial: pMaterial
            })
        }

        return this.args.data.map(item => getObj(item))
    }
}

