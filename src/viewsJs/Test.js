import * as THREE from 'three';
import * as CANNON from 'cannon-es'; // Ensure you have installed cannon-es
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Physics World
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // Set gravity in the physics world

const q = new CANNON.Quaternion()
q.setFromEuler(-Math.PI / 2, 0, 0); // Rotate to horizontal

// Ground (Physics)
const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC, // Static body
  shape: new CANNON.Plane(),
  quaternion: q,
  position: new CANNON.Vec3(0, 0, 0), // Ground at y = 0
});
// groundBody.quaternion.set(q.x, q.y, q.z, q.w); // Rotate to horizontal
world.addBody(groundBody);

// Ground (Three.js)
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x008800, side: THREE.DoubleSide });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.quaternion.set(q.x, q.y, q.z, q.w)
scene.add(groundMesh);

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Add a Dynamic Sphere (Physics + Three.js)
const sphereRadius = 1;
const sphereBody = new CANNON.Body({
  mass: 1, // Dynamic body
  shape: new CANNON.Sphere(sphereRadius),
  position: new CANNON.Vec3(0, 5, 0), // Start above the ground
});
world.addBody(sphereBody);

const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphereMesh);

// Animation Loop
const clock = new THREE.Clock();

function animate() {
  const deltaTime = clock.getDelta(); // Time step

  // Step the physics world
  world.step(1 / 60, deltaTime, 3);

  // Sync Three.js objects with Cannon.js bodies
  sphereMesh.position.copy(sphereBody.position);
  sphereMesh.quaternion.copy(sphereBody.quaternion);

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
