const FOV = 75;
const CAMERA_HEIGHT = 10;
const MOVEMENT_SPEED = 0.05;
const MIN_Z = -497;

const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, CAMERA_HEIGHT, -400);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', e => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.addEventListener('click', e => {
  document.body.requestPointerLock();
});
document.addEventListener('mousemove', e => {
  if (document.pointerLockElement) {
    camera.rotation.y -= e.movementX / 700;
    camera.rotation.x -= e.movementY / 700;
    if (camera.rotation.x > Math.PI / 2) camera.rotation.x = Math.PI / 2;
    else if (camera.rotation.x < -Math.PI / 2) camera.rotation.x = -Math.PI / 2;
  }
});

const keyToName = {87: 'w', 65: 'a', 83: 's', 68: 'd'};
const keys = {};
document.addEventListener('keydown', e => {
  if (keyToName[e.keyCode]) keys[keyToName[e.keyCode]] = true;
});
document.addEventListener('keyup', e => {
  if (keyToName[e.keyCode]) keys[keyToName[e.keyCode]] = false;
});

const scene = new THREE.Scene();
setupRoom(scene);

let lastTime;
function animate(time) {
  const elapsedTime = time - lastTime;

  const dx = Math.sin(camera.rotation.y);
  const dz = Math.cos(camera.rotation.y);
  if (keys.w) {
    camera.position.x -= dx * MOVEMENT_SPEED * elapsedTime;
    camera.position.z -= dz * MOVEMENT_SPEED * elapsedTime;
  }
  if (keys.s) {
    camera.position.x += dx * MOVEMENT_SPEED * elapsedTime;
    camera.position.z += dz * MOVEMENT_SPEED * elapsedTime;
  }
  if (keys.a) {
    camera.position.x -= dz * MOVEMENT_SPEED * elapsedTime;
    camera.position.z += dx * MOVEMENT_SPEED * elapsedTime;
  }
  if (keys.d) {
    camera.position.x += dz * MOVEMENT_SPEED * elapsedTime;
    camera.position.z -= dx * MOVEMENT_SPEED * elapsedTime;
  }
  if (camera.position.z < MIN_Z) camera.position.z = MIN_Z;

  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
  lastTime = time;
}

document.addEventListener('DOMContentLoaded', e => {
  document.body.appendChild(renderer.domElement);
  lastTime = Date.now();
  animate();
});
