const FOV = 75;
const SITTING_EYE_HEIGHT = 6;
const STANDING_EYE_HEIGHT = 11;
const MOVEMENT_SPEED = 0.05;
const MIN_Z = -497;

const shaders = window.location.pathname.slice(-12) === 'shaders.html';
const params = new URL(window.location).searchParams;

const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, SITTING_EYE_HEIGHT, -450);
camera.rotation.order = 'YXZ';

const listener = new THREE.AudioListener();
camera.add(listener);

const scene = new THREE.Scene();
const onframe = [];
setupRoom(scene, onframe);
loadPeople(scene, onframe);

const legs = createPlayerLegs();
legs.position.set(camera.position.x, 0, camera.position.z);
scene.add(legs);

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

const keyToName = {87: 'w', 65: 'a', 83: 's', 68: 'd', 16: 'shift'};
const keys = {};
document.addEventListener('keydown', e => {
  if (keyToName[e.keyCode]) keys[keyToName[e.keyCode]] = true;
});
document.addEventListener('keyup', e => {
  if (keyToName[e.keyCode]) keys[keyToName[e.keyCode]] = false;
});

const raycaster = new THREE.Raycaster();
let lastTime, lastSelectedMat = null, moving = false;
function animate(timeStamp) {
  const now = Date.now();
  const elapsedTime = now - lastTime;

  if (moving) {
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
  } else {
    if (keys.shift) {
      camera.position.y = STANDING_EYE_HEIGHT;
      moving = true;
      scene.remove(legs);
    }
  }

  /*
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const selectedMat = raycaster.intersectObjects(mats)[0] || null;
  if (selectedMat !== lastSelectedMat) {
    if (lastSelectedMat) {
      lastSelectedMat.object.material.emissive = new THREE.Color(0x000000);
    }
    lastSelectedMat = selectedMat;
    if (selectedMat) {
      selectedMat.object.material.emissive = new THREE.Color(0xf44336);
    }
  }
  */

  onframe.forEach(fn => fn(timeStamp, elapsedTime));

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
