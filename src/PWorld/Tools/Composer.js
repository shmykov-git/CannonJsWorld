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
            color: 0x0000ff,
            position: [0, 0, 0],
            scale: [1, 1, 1],
            boxScale: [1, 1, 1],
            pMaterial: pPlasticMaterial,
            boxMass: undefined,
            ...args
        }
        super(args)
    }

    getObjects() {
        const defaultColor = this.args.color
        const pMaterial = this.args.pMaterial
        const pos = this.args.position
        const mass = this.args.boxMass
        const scale = this.args.scale
        const sizeScale = vfn.scale(scale, this.args.boxScale)

        function getObj(item) {
            const [size, center, quaternion] = item.length == 3 ? item : [...item, [0, 0, 0, 1]]

            return new PBox({
                mass: mass,
                size: vfn.scale(size, sizeScale),      
                position: vfn.sum(vfn.scale(center, scale), pos),
                quaternion: quaternion,
                color: defaultColor,
                pMaterial: pMaterial
            })
        }

        return this.args.data.map(item => getObj(item))
    }
}

