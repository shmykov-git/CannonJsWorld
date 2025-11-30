import * as THREE from 'three';

export function getShaderMaterial1(color) {
    return new THREE.ShaderMaterial({
        vertexShader: `
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // красный
            }
        `
    })
}

export function getShaderMaterial(argb) {
    const shader = THREE.ShaderLib.phong;
    const a = ((argb >> 24) & 255) / 255;
    const r = ((argb >> 16) & 255) / 255;
    const g = ((argb >> 8) & 255) / 255;
    const b = (argb & 255) / 255;

    return new THREE.ShaderMaterial({
        //uniforms: THREE.UniformsUtils.clone(shader.uniforms),
        vertexShader: `
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            void main() {
                gl_FragColor = vec4(${a}, ${r}, ${g}, ${b}); // красный
            }
        `
    });
}
