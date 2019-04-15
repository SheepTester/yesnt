const FOV = 75;
const CAMERA_HEIGHT = 11;
const MOVEMENT_SPEED = 0.05;
const MIN_Z = -497;

const shaders = window.location.pathname.slice(-12) === 'shaders.html';

const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, CAMERA_HEIGHT, -400);
camera.rotation.order = 'YXZ';

const listener = new THREE.AudioListener();
camera.add(listener);

const scene = new THREE.Scene();
const onframe = setupRoom(scene);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

let composer;
if (shaders) {
  const renderScene = new THREE.RenderPass(scene, camera);
  const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
	bloomPass.threshold = 0;
	bloomPass.strength = 0.5;
	bloomPass.radius = 0;
  composer = new THREE.EffectComposer(renderer);
	composer.setSize(window.innerWidth, window.innerHeight);
	composer.addPass(renderScene);
	composer.addPass(bloomPass);
}

window.addEventListener('resize', e => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  if (shaders) composer.setSize(width, height);
});

let userInteracted;
const userInteraction = new Promise(res => userInteracted = res);

document.addEventListener('click', e => {
  document.body.requestPointerLock();
  userInteracted();
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

let lastTime;
function animate(timeStamp) {
  const now = Date.now();
  const elapsedTime = now - lastTime;

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

  onframe.forEach(fn => fn(elapsedTime, timeStamp));

  if (shaders) composer.render();
  else renderer.render(scene, camera);

  window.requestAnimationFrame(animate);
  lastTime = now;
}

document.addEventListener('DOMContentLoaded', e => {
  document.body.appendChild(renderer.domElement);
  lastTime = Date.now();
  animate();
});
