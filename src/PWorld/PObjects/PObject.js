import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class PObject {
    constructor(args, pShapes, mesh) {
        this.args = args
        this.id = args.id

        // Создание физического тела
        this.bodies = [...pShapes.map(shape => new CANNON.Body({
            mass: args.mass / pShapes.length, // Масса объекта
            position: new CANNON.Vec3(...args.position), // Начальная позиция
            shape: shape
        }))];

        this.body = this.bodies[0];

        // Кастомизируем тело
        this.bodies.forEach(body => {
            if (args.static)
                body.type = CANNON.Body.STATIC // Устанавливаем тип статического тела

            body.material = args.pMaterial;
            body.angularDamping = 0.5; // Damping to reduce spinning over time
        });

        this.mesh = mesh;
    }

    init(pWorld) {
        this.pWorld = pWorld;
        this.world = pWorld.world;
        this.scene = pWorld.scene;

        // Добавление тела в мир
        this.bodies.forEach(body => this.world.addBody(body));
        // Добавляем изображение на сцену
        this.scene.add(this.mesh);
    }

    update() {
        if (this.bodies.length > 1)
            return;
        
        if (this.pWorld.args.useWorldRadius)
            this.pWorld.enforceWorldRadius(this.body);

        let p = this.body.position;
        let q = this.body.quaternion;
        // меняем позицию mesh в соответствии с world body
        this.mesh.position.set(p.x, p.y, p.z);
        // вращаем mesh в соответствии с вращением world body
        this.mesh.quaternion.set(q.x, q.y, q.z, q.w);
    }            
}
