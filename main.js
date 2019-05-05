const FOV = 75;
const SITTING_EYE_HEIGHT = 6;
const STANDING_EYE_HEIGHT = 11;
const MOVEMENT_SPEED = 0.05;
const PLAYER_THICKNESS = 1;
const MIN_Z = -500 + PLAYER_THICKNESS;
const MAX_Z = 500 - PLAYER_THICKNESS;
const MIN_X = -500 + PLAYER_THICKNESS;
const MAX_X = 500 - PLAYER_THICKNESS;
const STUDENT_X_RADIUS = 2.5 + PLAYER_THICKNESS;
const STUDENT_BACK_SIZE = 1.75 + PLAYER_THICKNESS;
const STUDENT_FRONT_SIZE = 2.75 + PLAYER_THICKNESS;
const INSTRUCTOR_RUN_SPEED = 0.04;
const EXPANSION_SPEED = 0.0005;

const tunnelXBounds = {
  left: [
    -500 + DARK_DOOR_TUNNEL_PADDING + PLAYER_THICKNESS,
    -500 + DARK_DOOR_TUNNEL_PADDING + DARK_DOOR_TUNNEL_WIDTH - PLAYER_THICKNESS
  ],
  right: [
    500 - DARK_DOOR_TUNNEL_PADDING - DARK_DOOR_TUNNEL_WIDTH + PLAYER_THICKNESS,
    500 - DARK_DOOR_TUNNEL_PADDING - PLAYER_THICKNESS
  ]
};
const tunnelZBound = MAX_X + DARK_TUNNEL_LENGTH - PLAYER_THICKNESS;

const shaders = params.get('shaders') !== 'false';
const instructorCanMove = params.get('freeze-instructor') !== 'please';

const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';
function start() {
  if (cassette.isPlaying) cassette.stop();
  if (isDark()) {
    toggleLights();
    setFaces(awakeFace);
    instructor.face.map = awakeFace;
  }
  instructor.head.rotation.set(0, 0, 0);
  instructor.person.rotation.y = Math.PI;
  instructor.person.position.z = -475;
  instructor.limbs[0].limb.rotation.x = instructor.limbs[1].limb.rotation.x = Math.PI;
  instructor.limbs[0].forearm.rotation.x = instructor.limbs[1].forearm.rotation.x = 0;
  camera.position.set(0, SITTING_EYE_HEIGHT, MAT_FIRST_ROW_Z - 0.7);
  camera.rotation.set(0, 0, 0);
  scene.add(sittingPlayer.person);
  animations.push({type: 'start', start: Date.now(), duration: 1000});
  moving = 'sitting';
  playerState.canDie = false;
  if (playerState.phoneOut) setPhoneState(false);
  resetLimbRotations(sittingPlayer, false, restRotations);
  playerState.pose = 'rest';
}
let interruptInstructor = null;
const breathing = [
  'straw1', 'straw', 'straw2', 'straw', 'strawUseless', 'straw3', 'straw4',
  'strawClosing',
  'expansionOpening', 'normalBreath', 'expansionInstruct'
];
let yesState = null;
async function startGame() {
  instructor.moving = 'watch';
  instructor.walkOffsetTime = Date.now();
  const {speak, interrupt} = speaking(instructorVoice);
  let haltForever = false, haltYES = false, doneWithYES = false;
  interruptInstructor = reason => {
    if (reason === 'getting up') {
      haltYES = true;
      if (doneWithYES) {
        speak('stopRunning');
      }
    } else if (reason === 'caught') {
      haltYES = haltForever = true;
    }
    interrupt();
  };
  await speak('eyesClosed');
  const sound = new THREE.Audio(listener);
  sound.setBuffer(sounds.lights);
  sound.play();
  toggleLights();
  setFaces(sleepyFace);
  instructor.face.map = creepyFace;
  playerState.canDie = true;
  hintText.textContent = 'Press shift to get up; press F to take out/put away your phone.';
  animations.push({type: 'flash-hint', start: Date.now(), duration: 5000});
  for (const line of breathing) {
    if (line === 'expansionOpening') yesState = {type: 'expansion-ready'};
    await speak(line);
    if (haltYES) break;
  }
  if (!haltYES) {
    yesState = {type: 'expansion', mode: 'up', start: Date.now()};
    await speak('expansionArmsUp', 4000)
      && await speak('five', 1000)
      && await speak('six', 1000)
      && await speak('holdBreath', 2000)
      && await speak('three', 1000)
      && await speak('four', 1000)
      && (yesState = {type: 'expansion', mode: 'down', start: Date.now()})
      && await speak('expansionArmsDown', 4000)
      && await speak('five', 1000)
      && await speak('six', 1000)
      && await speak('holdBreath', 2000);
  }
  for (let i = 0; i < 3 && !haltYES; i++) {
    yesState = {type: 'expansion', mode: 'up', start: Date.now()};
    await speak('breatheIn', 1000)
      && await speak('two', 1000)
      && await speak('three', 1000)
      && await speak('four', 1000)
      && await speak('five', 1000)
      && await speak('six', 1000)
      && await speak('hold', 1000)
      && await speak('two', 1000)
      && await speak('three', 1000)
      && await speak('four', 1000)
      && (yesState = {type: 'expansion', mode: 'down', start: Date.now()})
      && await speak('breatheOut', 1000)
      && await speak('two', 1000)
      && await speak('three', 1000)
      && await speak('four', 1000)
      && await speak('five', 1000)
      && await speak('six', 1000)
      && await speak('hold', 1000)
      && await speak('two', 1000);
  }
  for (let i = 0; i < 3 && !haltYES; i++) {
    yesState = {type: 'expansion', mode: 'up', start: Date.now()};
    await speak('breatheIn', 6000)
      && await speak('hold', 4000)
      && (yesState = {type: 'expansion', mode: 'down', start: Date.now()})
      && await speak('breatheOut', 6000)
      && await speak('hold', 2000);
  }
  yesState = null;
  if (!haltYES) {
    await speak('relaxLong')
      && await speak('powerKleenex1')
      && await speak('powerOpening');
  }
  async function doPower() {
    yesState = {type: 'power-down', start: Date.now()};
    if (!haltYES) await speak('powerStart');
    for (let i = 0; i < 15 && !haltYES; i++) {
      yesState = {type: 'power-up', start: Date.now()};
      await speak('up', 800)
        && (yesState = {type: 'power-down', start: Date.now()})
        && await speak('down', 800);
    }
    yesState = null;
  }
  await doPower();
  if (!haltYES) {
    await speak('relaxShort')
      && await speak('powerKleenex2');
  }
  await doPower();
  if (!haltYES) {
    await speak('relaxShort')
      && await speak('powerLastRound');
  }
  await doPower();
  if (!haltYES) {
    await speak('relaxShort')
      && await speak('powerClosing')
      && await speak('powerKleenex3')
      && await speak('omOpening');
  }
  for (let i = 0; i < 3 && !haltYES; i++) {
    if (i > 0) await speak('omBreathe');
    if (!haltYES) {
      // TODO: adjust timings
      animations.push({type: 'intense-om', start: Date.now(), duration: 8000, anchorY: camera.position.y});
      await speak('om', 8000);
    }
  }
  if (haltYES) {
    if (!haltForever) await speak('stopRunning');
  } else {
    cassette.play();
    doneWithYES = true;
  }
}

const listener = new THREE.AudioListener();
camera.add(listener);

THREE.Cache.enabled = true;
const manager = new THREE.LoadingManager();
let loadingBar;
manager.onProgress = (url, loaded, total) => {
  if (loadingBar) loadingBar.style.width = (loaded / total * 100) + '%';
};
const textureLoader = new THREE.TextureLoader(manager);
const objectLoader = new THREE.ObjectLoader(manager);
const audioLoader = new THREE.AudioLoader(manager);
function loadTexture(url) {
  const texture = textureLoader.load(url);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

const sounds = {};
audioLoader.load('./sounds/lights-sound.mp3', buffer => sounds.lights = buffer);

const usingLambert = params.get('lambert') === 'true';
const gameMaterial = usingLambert ? (colour, emissive) => {
  return new THREE.MeshLambertMaterial({color: colour, emissive});
} : (colour, emissive, roughness, metalness) => {
  return new THREE.MeshStandardMaterial({color: colour, emissive, roughness, metalness});
};

const scene = new THREE.Scene();
scene.add(camera);

const onframe = [];
const collisionBoxes = [];
const {swap: toggleLights, isDark, darkPhongFloor, doors, cassette} = setupRoom(scene, onframe, collisionBoxes);
const {studentMap, instructor, instructorVoice, setFaces} = loadPeople(scene, onframe);

const playerState = {phoneOut: false, pose: 'rest', canDie: false};

const sittingPlayer = createPlayerSittingPerson();
sittingPlayer.person.position.set(camera.position.x, -5, MAT_FIRST_ROW_Z);

const phone = createPhone();
phone.phone.position.set(0.4, 2.5, 0);
phone.phone.rotation.set(Math.PI * 4 / 5, Math.PI / 8, -Math.PI * 3 / 20);

function setPhoneState(to) {
  if (playerState.phoneOut === to) return;
  playerState.phoneOut = to;
  if (to) {
    sittingPlayer.limbs[0].forearm.add(phone.phone);
    resetLimbRotations(sittingPlayer, true, phoneRotations);
    playerState.pose = 'phone';
  } else {
    sittingPlayer.limbs[0].forearm.remove(phone.phone);
    resetLimbRotations(sittingPlayer, true, restRotations);
    playerState.pose = 'rest';
  }
}

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
const codeChangeInterval = setInterval(() => { // don't clear! that way it can continue when you die
  c.fillStyle = 'black';
  c.fillRect(20, 50, 88, 100);
  char = (char + 1) % code.length;
  c.fillStyle = 'white';
  c.fillText(code[char], 20 + Math.random() * 40, 150 - Math.random() * 40);
  phone.update();
}, 3000);

const doorPopupCanvas = document.createElement('canvas');
doorPopupCanvas.width = 256;
doorPopupCanvas.height = 128;
const dc = doorPopupCanvas.getContext('2d');
dc.textAlign = 'center';
dc.textBaseline = 'top';
const doorPopupTexture = new THREE.CanvasTexture(doorPopupCanvas);
doorPopupTexture.magFilter = THREE.NearestFilter;
doorPopupTexture.minFilter = THREE.NearestFilter;
const doorPopup = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(28, 14),
  new THREE.MeshBasicMaterial({
    map: doorPopupTexture,
    transparent: true
  })
);
doorPopup.position.set(0, 7, 1.5);
let selectedDoor = null, typeProgress, typingState, typingTimeout = null;
function renderDoorPopup(internalCall = false) {
  dc.clearRect(0, 0, 256, 128);
  if (internalCall && typeProgress.length >= 6) {
    // TODO: check if it's right
    dc.fillStyle = '#ff0000';
    typingTimeout = setTimeout(() => {
      typeProgress = '';
      typingState = true;
      typingTimeout = null;
      renderDoorPopup();
    }, 500);
  } else {
    dc.fillStyle = '#00ffff';
  }
  dc.font = '20px sans-serif';
  dc.fillText('Press 0-9 to enter keycode:', 128, 5);
  dc.font = '30px sans-serif';
  dc.fillText(typeProgress, 128, 30);
  doorPopupTexture.needsUpdate = true;
  if (!internalCall && typeProgress.length >= 6) {
    typingState = false;
    typingTimeout = setTimeout(() => {
      renderDoorPopup(true);
    }, 500);
  }
}

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
  document.body.style.display = 'none';
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  if (shaders) composer.setSize(width, height);
  document.body.style.display = null;
});

let userInteracted;
const userInteraction = new Promise(res => userInteracted = res);

document.addEventListener('click', e => {
  document.body.requestPointerLock();
  userInteracted();
});
const MAX_ROTATION = Math.PI / 2;
let yRotation = camera.rotation.y;
function rotateCamera(deltaX, deltaY) {
  if (moving === 'chase') {
    camera.rotation.y -= deltaX;
  } else if (moving === 'sitting') {
    // this is probably more complicated than it needs to be
    const change = -deltaX;
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
  if (moving !== 'caught') {
    camera.rotation.x -= deltaY;
    if (camera.rotation.x > Math.PI / 2) camera.rotation.x = Math.PI / 2;
    else if (camera.rotation.x < -Math.PI / 2) camera.rotation.x = -Math.PI / 2;
  }
}
document.addEventListener('mousemove', e => {
  if (document.pointerLockElement) {
    rotateCamera(e.movementX / 700, e.movementY / 700);
  }
});

const keyToName = {
  87: 'forth', // w
  65: 'left', // a
  83: 'back', // s
  68: 'right', // d
  16: 'get-up', // shift
  70: 'phone', // f
  13: 'skip-intro', // enter
  8: 'del-code-digit', // backspace
  82: 'reset', // r
  79: 'om', // o
  81: 'inhale', // q
  69: 'exhale', // e
  32: 'trip', // space
  37: 'exp-down', // left
  38: 'power-up', // up
  39: 'exp-up', // right
  40: 'power-down' // down
};
const keys = {};
const onKeyPress = {
  phone() {
    if (!playerState.canDie) return;
    setPhoneState(!playerState.phoneOut);
  },
  reset() {
    if (!playerState.canDie) return;
    if (playerState.phoneOut) setPhoneState(false);
    if (playerState.pose !== 'rest') {
      resetLimbRotations(sittingPlayer, true, restRotations);
      playerState.pose = 'rest';
    }
  },
  'get-up'() {
    if (moving !== 'sitting' || !playerState.canDie) return;
    moving = 'chase';
    scene.remove(sittingPlayer.person);
    animations.push({type: 'get-up', start: Date.now(), duration: 200});
    instructor.moving = 'chase';
    instructor.head.rotation.y = 0;
    instructor.limbs[0].limb.rotation.x = instructor.limbs[1].limb.rotation.x = Math.PI * 1.4;
    instructor.limbs[0].forearm.rotation.x = instructor.limbs[1].forearm.rotation.x = Math.PI * 0.1;
    if (interruptInstructor) interruptInstructor('getting up');
    hintText.textContent = 'Use WASD to move around.';
    animations.push({type: 'flash-hint', start: Date.now(), duration: 5000});
  },
  'skip-intro'() {
    if (skipIntro) skipIntro();
  },
  'del-code-digit'() {
    if (selectedDoor && typingState) {
      typeProgress = typeProgress.slice(0, -1);
      renderDoorPopup();
    }
  },
  'power-down'() {
    if (playerState.phoneOut) setPhoneState(false);
    playerState.pose = 'power';
    resetLimbRotations(sittingPlayer, true, powerBreathDown);
  },
  'power-up'() {
    if (playerState.phoneOut) setPhoneState(false);
    playerState.pose = 'power';
    resetLimbRotations(sittingPlayer, true, powerBreathUp);
  }
};
document.addEventListener('keydown', e => {
  const key = keyToName[e.keyCode];
  if (key) {
    keys[key] = true;
    if (onKeyPress[key]) onKeyPress[key]();
  }
});
document.addEventListener('keyup', e => {
  if (keyToName[e.keyCode]) keys[keyToName[e.keyCode]] = false;
});
for (let i = 0; i < 10; i++) {
  keyToName[i + 48] = i + '';
  onKeyPress[i] = () => {
    if (selectedDoor && typingState) {
      typeProgress += i;
      renderDoorPopup();
    }
  };
}

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
  moving = 'caught';
  document.body.style.backgroundColor = 'red';
  animations.push({
    type: 'intensify',
    start: Date.now(),
    duration: 2000,
    zoomIntensity: camera.position.distanceTo(headPos) / 20,
    anchorY: camera.position.y
  });
  if (interruptInstructor) interruptInstructor('caught');
}

let hintText;
let lastTime, moving;
const animations = [];
const raycaster = new THREE.Raycaster();
function animate() {
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
          camera.filmOffset = 0;
          camera.updateProjectionMatrix();
          start();
          startGame();
          document.body.style.backgroundColor = null;
          break;
        }
        case 'intense-om': {
          camera.filmOffset = 0;
          camera.updateProjectionMatrix();
          break;
        }
        case 'get-up': {
          camera.position.y = STANDING_EYE_HEIGHT;
          break;
        }
        case 'flash-hint': {
          hintText.style.opacity = 0;
          break;
        }
        case 'show-expansion':
        case 'show-power': {
          resetLimbRotations(instructor, true, instructorRotations);
          animation.onDone();
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
        case 'intense-om': {
          const position = 1 - easeOutCubic(progress);
          camera.filmOffset = (Math.random() - 0.5) * position * 3;
          camera.position.y = animation.anchorY + (Math.random() - 0.5) * position * 3;
          camera.updateProjectionMatrix();
          break;
        }
        case 'get-up': {
          camera.position.y = easeOutCubic(progress) * (STANDING_EYE_HEIGHT - SITTING_EYE_HEIGHT) + SITTING_EYE_HEIGHT;
          break;
        }
        case 'flash-hint': {
          hintText.style.opacity = easeOutCubic(1 - progress);
          break;
        }
        case 'show-expansion': {
          if (progress < 0.5) {
            animateExpansionBreathUp(instructor, progress * 18000);
          } else {
            animateExpansionBreathDown(instructor, (progress - 0.5) * 18000);
          }
          break;
        }
        case 'show-power': {
          if (progress < 0.25) {
            if (animation.step !== 1) {
              resetLimbRotations(instructor, true, powerBreathDown);
              animation.step = 1;
            }
          } else if (progress < 0.5) {
            if (animation.step !== 2) {
              resetLimbRotations(instructor, true, powerBreathUp);
              animation.step = 2;
            }
          } else if (progress < 0.75) {
            if (animation.step !== 3) {
              resetLimbRotations(instructor, true, powerBreathDown);
              animation.step = 3;
            }
          } else {
            if (animation.step !== 4) {
              resetLimbRotations(instructor, true, powerBreathUp);
              animation.step = 4;
            }
          }
          break;
        }
      }
    }
  }

  if (moving === 'chase') {
    const sin = Math.sin(camera.rotation.y);
    const cos = Math.cos(camera.rotation.y);
    const movement = new THREE.Vector3();
    if (touchMovement) {
      movement.x = touchMovement.x * cos + touchMovement.y * sin;
      movement.z = -touchMovement.x * sin + touchMovement.y * cos;
    }
    if (keys.forth) {
      movement.x -= sin;
      movement.z -= cos;
    }
    if (keys.back) {
      movement.x += sin;
      movement.z += cos;
    }
    if (keys.left) {
      movement.x -= cos;
      movement.z += sin;
    }
    if (keys.right) {
      movement.x += cos;
      movement.z -= sin;
    }
    if (movement.lengthSq() > 1) movement.normalize();
    movement.multiplyScalar(MOVEMENT_SPEED * elapsedTime);

    const matX = Math.round(camera.position.x / (MAT_WIDTH + MAT_SPACING));
    const matZ = Math.round((camera.position.z - MAT_FIRST_ROW_Z) / (MAT_LENGTH + MAT_SPACING));
    const studentX = matX * (MAT_WIDTH + MAT_SPACING);
    const studentZ = matZ * (MAT_LENGTH + MAT_SPACING) + MAT_FIRST_ROW_Z;
    const stagger = matX % 2 === 0 ? STAGGER_DISTANCE : -STAGGER_DISTANCE;
    const rects = [...collisionBoxes];
    if (studentMap[`${matX},${matZ}`]) {
      rects.push([
        studentX - STUDENT_X_RADIUS,
        studentX + STUDENT_X_RADIUS,
        studentZ - STUDENT_FRONT_SIZE + stagger,
        studentZ + STUDENT_BACK_SIZE + stagger
      ]);
    }

    camera.position.x += movement.x;
    if (camera.position.x < MIN_X) camera.position.x = MIN_X;
    if (camera.position.x > MAX_X) {
      if (
        camera.position.z >= tunnelXBounds.left[0] && camera.position.z <= tunnelXBounds.left[1]
        || camera.position.z >= tunnelXBounds.right[0] && camera.position.z <= tunnelXBounds.right[1]
      ) {
        if (camera.position.x > tunnelZBound)
          camera.position.x = tunnelZBound;
      } else {
        camera.position.x = MAX_X;
      }
    }
    rects.forEach(([minX, maxX, minZ, maxZ]) => {
      if (camera.position.z > minZ && camera.position.z < maxZ) {
        if (camera.position.x > minX && camera.position.x < maxX) {
          if (movement.x > 0) camera.position.x = minX;
          else camera.position.x = maxX;
        }
      }
    });

    camera.position.z += movement.z;
    if (camera.position.z < MIN_Z) camera.position.z = MIN_Z;
    if (camera.position.z > MAX_Z) camera.position.z = MAX_Z;
    if (camera.position.x > MAX_X) {
      if (camera.position.z < 0) {
        if (camera.position.z < tunnelXBounds.left[0]) camera.position.z = tunnelXBounds.left[0];
        if (camera.position.z > tunnelXBounds.left[1]) camera.position.z = tunnelXBounds.left[1];
      } else {
        if (camera.position.z < tunnelXBounds.right[0]) camera.position.z = tunnelXBounds.right[0];
        if (camera.position.z > tunnelXBounds.right[1]) camera.position.z = tunnelXBounds.right[1];
      }
    }
    rects.forEach(([minX, maxX, minZ, maxZ]) => {
      if (camera.position.x > minX && camera.position.x < maxX) {
        if (camera.position.z > minZ && camera.position.z < maxZ) {
          if (movement.z > 0) camera.position.z = minZ;
          else camera.position.z = maxZ;
        }
      }
    });

    raycaster.setFromCamera(new THREE.Vector2(), camera);
    const intersection = raycaster.intersectObjects(doors, true)[0];
    if (intersection && intersection.distance < 40) {
      let object = intersection.object;
      while (object && !object.isDoors) {
        object = object.parent;
      }
      if (!object) {
        console.log('oof', intersection.object);
        return;
      }
      if (selectedDoor !== object) {
        if (typingTimeout) clearTimeout(typingTimeout);
        selectedDoor = object;
        object.add(doorPopup);
        typeProgress = '';
        typingState = true;
        renderDoorPopup();
      }
    } else if (selectedDoor) {
      if (typingTimeout) clearTimeout(typingTimeout);
      selectedDoor.remove(doorPopup);
      selectedDoor = null;
    }

    const angle = Math.atan2(
      instructor.person.position.x - camera.position.x,
      instructor.person.position.z - camera.position.z
    );
    instructor.person.rotation.y = angle;
    if (instructorCanMove) {
      instructor.person.position.x -= Math.sin(angle) * INSTRUCTOR_RUN_SPEED * elapsedTime;
      instructor.person.position.z -= Math.cos(angle) * INSTRUCTOR_RUN_SPEED * elapsedTime;
    }

    if (camera.position.distanceToSquared(instructor.person.position) < 144) {
      caught();
    }
  } else if (moving === 'sitting') {
    const instructorDirection = instructor.head.getWorldDirection(new THREE.Vector3()).setY(0);
    const playerDirection = instructor.person.position.clone().sub(camera.position).setY(0);
    if (instructorDirection.angleTo(playerDirection) < Math.PI * 0.2) {
      if (playerState.phoneOut) {
        caught();
      }
    }
    if (keys['exp-down'] || keys['exp-up']) {
      if (playerState.pose !== 'expansion') {
        if (playerState.phoneOut) setPhoneState(false);
        resetLimbRotations(sittingPlayer, true, defaultExpansionRotations);
        playerState.pose = 'expansion';
        playerState.position = 0;
      }
      if (keys['exp-down']) playerState.position -= EXPANSION_SPEED * elapsedTime;
      if (keys['exp-up']) playerState.position += EXPANSION_SPEED * elapsedTime;
      if (playerState.position < 0) playerState.position = 0;
      else if (playerState.position > 1) playerState.position = 1;
      sittingPlayer.limbs[0].limb.idealRot.z = playerState.position * (Math.PI - 0.2) + 0.1;
      sittingPlayer.limbs[1].limb.idealRot.z = -playerState.position * (Math.PI - 0.2) - 0.1;
    }
  }

  if (darkPhongFloor) {
    darkPhongFloor.position.set(camera.position.x, 0, camera.position.z);
  }

  onframe.forEach(fn => fn(now, elapsedTime));
  processLimbs(instructor);
  processLimbs(sittingPlayer);

  if (shaders) composer.render();
  else renderer.render(scene, camera);

  window.requestAnimationFrame(animate);
  lastTime = now;
}

const intro = [
  'intro', 'introStraw', 'introExpansion1', 'introExpansion2', 'introExpansion3',
  'introExpansion4', 'introPower1', 'introPower2', 'introOm', 'introSohum1',
  'introSohum2', 'introSohum3', 'introSohum4', 'introStagger', 'introThreat1',
  'introThreat2'
];
let skipIntro = null;

document.addEventListener('DOMContentLoaded', e => {
  hintText = document.getElementById('hint');
  loadingBar = document.getElementById('progress-bar');

  document.body.appendChild(renderer.domElement);
  initTouch();

  lastTime = Date.now();
  renderer.domElement.style.opacity = 0;
  Promise.all([
    new Promise(res => manager.onLoad = res).then(() => {
      loadingBar.classList.add('hide-bar');
    }),
    initSpeech()
  ]).then(async () => {
    document.body.classList.add('hide-note');
    start();
    animate();

    hintText.textContent = 'Press enter to skip the intro.';
    animations.push({type: 'flash-hint', start: Date.now(), duration: 5000});
    const {speak, interrupt} = speaking(instructorVoice);
    let dontContinue = false, currentAnimation = null;
    skipIntro = () => {
      interrupt();
      dontContinue = true;
      if (currentAnimation) currentAnimation.duration = 0;
    };
    for (const line of intro) {
      if (line === 'introExpansion1') {
        await Promise.all([
          speak('introExpansion1'),
          new Promise(res => {
            resetLimbRotations(instructor, true, defaultExpansionRotations);
            animations.push(currentAnimation = {type: 'show-expansion', start: Date.now(), duration: 5000, onDone: res});
          })
        ]);
        currentAnimation = null;
      } else if (line === 'introPower1') {
        await Promise.all([
          speak('introPower1'),
          new Promise(res => {
            animations.push(currentAnimation = {type: 'show-power', start: Date.now(), duration: 2000, onDone: res});
          })
        ]);
        currentAnimation = null;
      } else {
        await speak(line);
      }
      if (dontContinue) break;
    }
    skipIntro = null;
    startGame();
  });
});
