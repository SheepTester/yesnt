const FOV = 75;
const SITTING_EYE_HEIGHT = 6;
const STANDING_EYE_HEIGHT = 11;
const MOVEMENT_SPEED = 0.05;
const MIN_Z = -497;

const shaders = window.location.pathname.slice(-12) === 'shaders.html';
const params = new URL(window.location).searchParams;

const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';
function start() {
  camera.position.set(0, SITTING_EYE_HEIGHT, -450.7);
  camera.rotation.set(0, 0, 0);
  instructor.moving = true;
  instructor.head.rotation.set(0, 0, 0);
  scene.add(sittingPlayer.person);
  animations.push({type: 'start', start: Date.now(), duration: 1000});
  moving = false;
}

const listener = new THREE.AudioListener();
camera.add(listener);

const manager = new THREE.LoadingManager();

const scene = new THREE.Scene();
const onframe = [];
setupRoom(scene, onframe);
loadPeople(scene, onframe);

const sittingPlayer = createPlayerSittingPerson();
sittingPlayer.person.position.set(camera.position.x, -5, -450);
const phone = createPhone();
phone.phone.position.set(0.4, 2.5, 0);
phone.phone.rotation.set(Math.PI * 4 / 5, Math.PI / 8, -Math.PI * 3 / 20);
sittingPlayer.limbs[0].forearm.add(phone.phone);
const c = phone.canvas.getContext('2d');
c.fillStyle = '#BE1E2D';
c.fillRect(0, 0, 128, 30);
c.fillStyle = 'black';
c.fillRect(20, 50, 88, 100);
c.font = '15px monospace';
c.fillStyle = 'white';
c.fillText('Gunn admin MSG', 5, 25);
c.font = 'bold 100px monospace';
const code = (Math.random() * 1e6 >> 0).toString().padStart(6, '0') + ' ';
let char = code.length - 1;
const codeChangeInterval = setInterval(() => {
  c.fillStyle = 'black';
  c.fillRect(20, 50, 88, 100);
  char = (char + 1) % code.length;
  c.fillStyle = 'white';
  c.fillText(code[char], 20 + Math.random() * 40, 150 - Math.random() * 40);
  phone.update();
}, 3000);

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
const MAX_ROTATION = Math.PI / 2;
let yRotation = camera.rotation.y;
document.addEventListener('mousemove', e => {
  if (document.pointerLockElement) {
    if (moving) {
      camera.rotation.y -= e.movementX / 700;
    } else if (moving !== null) {
      // this is probably more complicated than it needs to be
      const change = -e.movementX / 700;
      yRotation += change;
      if (yRotation > MAX_ROTATION && change > 0) {
        camera.rotation.y = MAX_ROTATION + 1 - 1 / (1 + yRotation - MAX_ROTATION);
      } else if (yRotation < -MAX_ROTATION && change < 0) {
        camera.rotation.y = -MAX_ROTATION - 1 + 1 / (1 - yRotation - MAX_ROTATION);
      } else {
        camera.rotation.y += change;
        if (camera.rotation.y > MAX_ROTATION) {
          yRotation = MAX_ROTATION + 1 / (1 - camera.rotation.y + MAX_ROTATION) - 1;
        } else if (camera.rotation.y < -MAX_ROTATION) {
          yRotation = -MAX_ROTATION + 1 - 1 / (1 + camera.rotation.y + MAX_ROTATION);
        } else yRotation = camera.rotation.y;
      }
    }
    if (moving !== null) {
      camera.rotation.x -= e.movementY / 700;
      if (camera.rotation.x > Math.PI / 2) camera.rotation.x = Math.PI / 2;
      else if (camera.rotation.x < -Math.PI / 2) camera.rotation.x = -Math.PI / 2;
    }
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

function easeOutCubic(t) {
  t--;
  return t * t * t + 1;
}
function easeInCubic(t) {
  return t * t * t;
}

function caught() {
  const headPos = instructor.head.getWorldPosition(new THREE.Vector3());
  camera.lookAt(headPos);
  instructor.head.lookAt(camera.position);
  instructor.head.rotation.y += Math.PI;
  instructor.moving = false;
  moving = null;
  document.body.style.backgroundColor = 'red';
  animations.push({
    type: 'intensify',
    start: Date.now(),
    duration: 2000,
    zoomIntensity: camera.position.distanceTo(headPos) / 20,
    anchorY: camera.position.y
  });
}

const raycaster = new THREE.Raycaster();
let lastTime, moving;
const animations = [];
function animate(timeStamp) {
  const now = Date.now();
  const elapsedTime = now - lastTime;

  for (let i = 0; i < animations.length; i++) {
    const animation = animations[i];
    const progress = (now - animation.start) / animation.duration;
    if (progress > 1) {
      switch (animation.type) {
        case 'start': {
          renderer.domElement.style.opacity = null;
          camera.zoom = 1;
          camera.updateProjectionMatrix();
          break;
        }
        case 'intensify': {
          start();
          document.body.style.backgroundColor = null;
          break;
        }
        case 'get-up': {
          camera.position.y = STANDING_EYE_HEIGHT;
          break;
        }
      }
      animations.splice(i--, 1);
    } else {
      switch (animation.type) {
        case 'start': {
          const position = easeOutCubic(progress);
          renderer.domElement.style.opacity = position;
          camera.zoom = 2 - position;
          camera.updateProjectionMatrix();
          break;
        }
        case 'intensify': {
          const position = easeInCubic(progress);
          camera.filmOffset = (Math.random() - 0.5) * position * 3;
          camera.position.y = animation.anchorY + (Math.random() - 0.5) * position * 3;
          if (progress > 0.7) {
            camera.zoom = animation.zoomIntensity + 1;
          } else {
            camera.zoom = easeInCubic(progress / 0.7) * animation.zoomIntensity + 1;
          }
          camera.updateProjectionMatrix();
          renderer.domElement.style.opacity = 1 - position * 0.5;
          break;
        }
        case 'get-up': {
          camera.position.y = easeOutCubic(progress) * (STANDING_EYE_HEIGHT - SITTING_EYE_HEIGHT) + SITTING_EYE_HEIGHT;
          break;
        }
      }
    }
  }

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
  } else if (moving !== null) {
    if (keys.shift) {
      moving = true;
      scene.remove(sittingPlayer.person);
      clearInterval(codeChangeInterval);
      animations.push({type: 'get-up', start: Date.now(), duration: 200});
    }
    if (camera.rotation.x <= -0.4) {
      const instructorDirection = instructor.head.getWorldDirection(new THREE.Vector3()).setY(0);
      const playerDirection = instructor.person.position.clone().sub(camera.position).setY(0);
      if (instructorDirection.angleTo(playerDirection) < Math.PI * 0.2) {
        caught();
      }
    }
  }

  onframe.forEach(fn => fn(timeStamp, elapsedTime));

  if (shaders) composer.render();
  else renderer.render(scene, camera);

  window.requestAnimationFrame(animate);
  lastTime = now;
}

document.addEventListener('DOMContentLoaded', e => {
  document.body.appendChild(renderer.domElement);
  lastTime = Date.now();
  renderer.domElement.style.opacity = 0;
  manager.onLoad = () => {
    start();
  };
  animate();
});
