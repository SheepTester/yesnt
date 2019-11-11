// tju = three.js unit
const SITTING_EYE_HEIGHT = 6;
const STANDING_EYE_HEIGHT = 11;
const MOVEMENT_SPEED = 0.05; // speed of player (tju/ms)
const PLAYER_THICKNESS = 1; // padding around collision boxes to account for player thickness (tju)
const MIN_Z = -500 + PLAYER_THICKNESS; // dark gym walls bounding boxes (tju)
const MAX_Z = 500 - PLAYER_THICKNESS;
const MIN_X = -500 + PLAYER_THICKNESS;
const MAX_X = 500 - PLAYER_THICKNESS;
const STUDENT_X_RADIUS = 2.5 + PLAYER_THICKNESS; // collision boxes of students sitting on mats (tju)
const STUDENT_BACK_SIZE = 1.75 + PLAYER_THICKNESS;
const STUDENT_FRONT_SIZE = 2.75 + PLAYER_THICKNESS;
const INSTRUCTOR_RUN_SPEED = 0.04; // speed of instructor in chase mode (tju/ms)
const EXPANSION_SPEED = 0.0005; // speed of expansion breath arm progress (100%/ms)
const EXPANSION_PREP_TIME = 1200; // time instructor allows you to enter expansion breath pose (ms)
const EXPANSION_REACTION_TIME = 3250; // time instructor allows you to bring your arms up/down (ms)
const POWER_PREP_TIME = Infinity; // same as above two, but for power breath
const POWER_REACTION_TIME = 450;
const POWER_EARLY_TIME = 300; // time in which instructor allows you to bring your arms back early (ms)
const PHONE_LENIENCY_DELAY = 200;
const INHALE_OXYGEN_SPEED = +params.get('INHALE_OXYGEN_SPEED') || 0.3; // how much oxygen you get when your lungs expand (O/L)
const BREATHING_SPEED = +params.get('BREATHING_SPEED') || 0.00001; // how fast lungs expand/contract (L/ms^2)
const BREATHING_BOOST_SPEED = +params.get('BREATHING_BOOST_SPEED') || 0.003; // how fast lungs expand/contract when the breathe key is initially pressed (L/ms)
const MAX_OXYGEN = +params.get('MAX_OXYGEN') || 1; // playerState.oxygen max (O)
const LUNG_RANGE = +params.get('LUNG_RANGE') || 1; // playerState.lungSize max; determines when the slowing down affect starts, goes (-, +) (L)
const LIVING_OXYGEN_USAGE = +params.get('LIVING_OXYGEN_USAGE') || 0.00003; // how much oxygen you lose by living (O/ms)
const RUNNING_OXYGEN_USAGE = +params.get('RUNNING_OXYGEN_USAGE') || 0.0001; // how much oxygen you lose by running (O/ms)
const LOW_OXYGEN = +params.get('LOW_OXYGEN') || 0.4; // point at which the screen starts dimming, warning you to breathe (O)
const ASPHYXIATION = +params.get('ASPHYXIATION') || 0.1; // point at which you black out (O)
const CODE_LENGTH = 4;
const KEY_HINT_CYCLE_SPEED = 5000;
// ?INHALE_OXYGEN_SPEED=0.0003&BREATHING_SPEED=0.00005&MAX_OXYGEN=1&LUNG_RANGE=1&LIVING_OXYGEN_USAGE=0.00005&LOW_OXYGEN=0.4&ASPHYXIATION=0.1

let totalStats, stats;
try {
  totalStats = JSON.parse(localStorage.getItem('[yesnt] stats'));
  if (totalStats === null || typeof totalStats !== 'object') throw new Error();
} catch (e) {
  totalStats = JSON.parse(JSON.stringify({
    attempts: 0,
    runDistance: 0,
    breaths: 0,
    powerBreaths: 0,
    expansionBreaths: 0,
    time: 0,
    checks: 0,
    fails: 0,
    codeEntries: 0,
    escapes: 0,
    abridgedCompletions: 0,
    completions: 0
  }));
}
function saveStats(stats = null) {
  if (stats) {
    totalStats.attempts++;
    totalStats.runDistance += stats.runDistance;
    totalStats.breaths += stats.breaths;
    totalStats.powerBreaths += stats.powerBreaths;
    totalStats.expansionBreaths += stats.expansionBreaths;
    totalStats.time += stats.duration;
    totalStats.checks += stats.checks;
    totalStats.fails += stats.fails;
    totalStats.codeEntries += stats.codeEntries;
    displayTotalStats();
  }
  if (!devMode) {
    localStorage.setItem('[yesnt] stats', JSON.stringify(totalStats));
  }
}
let statTable, totalStatTable;
let usernameInput, urlInput, problemMessage, submitScoreBtn, leaderboard;
const badNameRegex = /[^A-Z0-9]/i;
const urlRegex = /^(https?):\/\/[\-A-Za-z0-9+&@#\/%?=~_|!:,.;]*[\-A-Za-z0-9+&@#\/%=~_|]$/;
function statRow([label, value]) {
  const row = document.createElement('div');
  row.classList.add('stat-row');

  const labelItem = document.createElement('div');
  labelItem.classList.add('stat-label');
  labelItem.textContent = label;
  row.appendChild(labelItem);

  const valueItem = document.createElement('div');
  valueItem.classList.add('stat-value');
  valueItem.textContent = value;
  row.appendChild(valueItem);

  return row;
}
function displayStats() {
  const durationString = Math.floor(stats.duration / 60000) + ':'
    + (stats.duration / 1000).toFixed(3).padStart(6, '0');
  statTable.innerHTML = '';
  if (stats.winMode === 'escape') {
    [
      ['Time taken', durationString],
      ['Breaths taken', stats.breaths],
      ['Distance run', stats.runDistance.toFixed(2)],
      ['Codes entered', stats.codeEntries]
    ].forEach(entry => statTable.appendChild(statRow(entry)));
  } else {
    [
      ['Time taken', durationString],
      ['Breaths taken', stats.breaths],
      ['Power breaths', stats.powerBreaths],
      ['Expansion breaths', stats.expansionBreaths],
      ['Accuracy', (stats.accuracy * 100).toFixed(2) + '%']
    ].forEach(entry => statTable.appendChild(statRow(entry)));
  }
}
function displayTotalStats() {
  const durationString = Math.floor(totalStats.time / 3600000) + ':'
    + (Math.floor(totalStats.time / 60000 % 60) + '').padStart(2, '0') + ':'
    + (totalStats.time / 1000).toFixed(3).padStart(6, '0');
  const accuracy = totalStats.checks
    ? ((1 - totalStats.fails / totalStats.checks) * 100).toFixed(2) + '%'
    : '--';
  totalStatTable.innerHTML = '';
  [
    ['Attempts', totalStats.attempts],
    ['Escapes', totalStats.escapes],
    ['Completions', totalStats.completions],
    ['Abridged completions', totalStats.abridgedCompletions],
    ['Time played', durationString],
    ['Breaths taken', totalStats.breaths],
    ['Power breaths', totalStats.powerBreaths],
    ['Expansion breaths', totalStats.expansionBreaths],
    ['YES program accuracy', accuracy],
    ['Distance run', totalStats.runDistance.toFixed(2)],
    ['Codes entered', totalStats.codeEntries]
  ].forEach(entry => totalStatTable.appendChild(statRow(entry)));
}
function displayLeaderboard(scores, headings, myEntry) {
  leaderboard.innerHTML = '';
  const columns = {};
  headings.forEach(([id, name, label]) => {
    const column = document.createElement('div');
    column.classList.add('column');
    leaderboard.appendChild(column);
    columns[id] = column;
    const heading = document.createElement('span');
    heading.classList.add('leaderboard-entry');
    heading.classList.add('heading');
    heading.textContent = name;
    heading.title = label;
    column.appendChild(heading);
  });
  let myScoreDisplayed = false;
  scores.slice(0, 10).forEach((score, i) => {
    headings.forEach(([id]) => {
      const entry = document.createElement(id === 'name' ? 'a' : 'span');
      entry.classList.add('leaderboard-entry');
      if (score.id === myEntry) {
        entry.classList.add('mine');
        myScoreDisplayed = true;
      }
      if (id === 'name') {
        entry.classList.add('entry-name');
        if (score.url) {
          entry.href = score.url;
          entry.setAttribute('target', '_blank');
          entry.setAttribute('rel', 'noopener noreferrer');
        }
      } else {
        entry.classList.add('entry-data');
      }
      entry.textContent = id === 'accuracy'
        ? (score.accuracy * 100).toFixed(2) + '%'
        : id === 'index'
        ? i + 1
        : score[id];
      columns[id].appendChild(entry);
    });
  });
  if (!myScoreDisplayed) {
    const scoreIndex = scores.findIndex(score => score.id === myEntry);
    if (!~scoreIndex) return "okn't";
    const score = scores[scoreIndex];
    headings.forEach(([id]) => {
      const ellipsis = document.createElement('span');
      ellipsis.classList.add('leaderboard-entry');
      ellipsis.classList.add('ellipsis');
      columns[id].appendChild(ellipsis);
      const entry = document.createElement(id === 'name' ? 'a' : 'span');
      entry.classList.add('leaderboard-entry');
      entry.classList.add('mine');
      if (id === 'name') {
        entry.classList.add('entry-name');
        if (score.url) {
          entry.href = score.url;
          entry.setAttribute('target', '_blank');
          entry.setAttribute('rel', 'noopener noreferrer');
        }
      } else {
        entry.classList.add('entry-data');
      }
      entry.textContent = id === 'accuracy'
        ? (score.accuracy * 100).toFixed(2) + '%'
        : id === 'index'
        ? scoreIndex + 1
        : score[id];
      columns[id].appendChild(entry);
    });
  }
  return 'ok';
}

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
const checkPlayer = !params.get('override-player-check');
const alwaysCheckPlayer = params.get('override-player-check') === 'omniscient';
const loseOxygen = params.get('unrealistic-breathing') !== 'true';
const abridged = params.get('abridged') || (options.abridged ? 'some' : null);
const POWER_REPS = abridged === 'some' ? 10 : abridged === 'very' ? 2 : 15;
const OMS = abridged === 'very' ? 1 : 3;

const camera = new THREE.PerspectiveCamera(options.fov, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';

const digitSet = '0123456789';
const symbolSet = '零壹貳贰叄叁肆伍陸陆柒捌玖拾佰仟萬億';
const fullWidthDigits = '０１２３４５６７８９';
function start(minimal = false) {
  if (codeChangeInterval) clearInterval(codeChangeInterval);
  if (cassette.isPlaying) cassette.stop();
  if (isDark()) {
    toggleLights();
    setFaces(awakeFace);
    instructor.face.map = awakeFace;
  }
  instructor.head.rotation.set(0, 0, 0);
  instructor.person.rotation.y = Math.PI;
  instructor.person.position.x = 0;
  instructor.person.position.z = -475;
  instructor.limbs[0].limb.rotation.x = instructor.limbs[1].limb.rotation.x = Math.PI;
  instructor.limbs[0].forearm.rotation.x = instructor.limbs[1].forearm.rotation.x = 0;
  instructor.limbs[2].limb.rotation.x = Math.PI;
  instructor.limbs[3].limb.rotation.x = Math.PI;
  instructor.limbs[2].forearm.rotation.x = 0;
  instructor.limbs[3].forearm.rotation.x = 0;
  if (!minimal) {
    camera.position.set(0, SITTING_EYE_HEIGHT, MAT_FIRST_ROW_Z - 0.7);
    camera.rotation.set(0, 0, 0);
    limitSittingHorizRot.set(camera.rotation.y);
    scene.add(sittingPlayer.person);
    animations.push({type: 'start', start: Date.now(), duration: 1000});
    moving = 'sitting';
    document.body.classList.remove('hide-pose');
    document.body.classList.remove('escaped');
    document.body.classList.remove('completed');
  }
  playerState.needsDown = false;
  if (playerState.phoneOut) setPhoneState(false);
  playerState.canDie = false;
  resetLimbRotations(sittingPlayer, false, restRotations);
  setPose('rest');
  if (playerState.canBreathe) setCanBreathe(false);
  playerState.canAsphyxiate = true;
  if (lampHand.children.length) lights.get(lampHand.children[0]).add(lampHand.children[0]);
  removeKeyHint(true); // remove what? yes.
  if (selectedDoor) {
    selectedDoor.remove(doorPopup);
    selectedDoor = null;
  }
  if (minimal) return;
  if (document.body.classList.contains('hide-dev')) {
    problemMessage.classList.add('hidden');
    submitScoreBtn.disabled = false;
  }
  code = '';
  const digits = digitSet.split('');
  const symbols = symbolSet.split('');
  const key = new Map();
  let i;
  for (i = 0; i < digitSet.length; i++) {
    const digitIndex = Math.floor(Math.random() * (10 - i));
    const symbolIndex = Math.floor(Math.random() * (10 - i));
    if (i < CODE_LENGTH) code += digits[digitIndex];
    key.set(digits[digitIndex], symbols[symbolIndex]);
    digits[digitIndex] = digits[digits.length - 1 - i];
    symbols[symbolIndex] = symbols[symbols.length - 1 - i];
  }
  let frame = 0;
  codeChangeInterval = setInterval(() => {
    c.fillStyle = '#666';
    c.fillRect(0, 30, 128, 226);
    c.fillStyle = 'black';
    if (frame % 16 > 11) {
      c.font = '64px monospace';
      c.fillText(key.get(code[0]), 0, 90);
      c.fillText(key.get(code[1]), 64, 180);
      c.fillText(key.get(code[2]), 0, 180);
      c.fillText(key.get(code[3]), 64, 90);
    } else if (frame % 16 === 11) {
      c.font = '64px monospace';
      c.fillText(fullWidthDigits[0], 0, 90);
      c.fillText(fullWidthDigits[1], 64, 180);
      c.fillText(fullWidthDigits[2], 0, 180);
      c.fillText(fullWidthDigits[3], 64, 90);
    } else if (frame % 16 === 10) {
      c.font = '32px monospace';
      for (let i = 0; i < 4; i++) {
        c.strokeRect(i * 32 + 2, 50, 28, 50);
        c.fillText('#', i * 32 + 5, 90);
        c.fillText(fullWidthDigits[i], i * 32, 130);
      }
      c.font = '16px monospace';
      c.fillText('Symbols not in', 0, 160);
      c.fillText('Chinese! -L.M.', 0, 180);
    } else {
      const digit = frame % 16 + '';
      c.font = '44px monospace';
      c.fillText(key.get(digit) + '＝' + fullWidthDigits[digit], 0, 90);
    }
    frame++;
    phone.update();
  }, 500);
  doors.forEach(door => {
    door.wrong = false;
  });
  testedTunnelDoor = params.get('one-door-only') === 'true';
}
let interruptInstructor = null;
const breathing = params.get('skip-to') === 'expansion' ? ['expansionOpening'] : [
  'straw1', 'straw', 'straw2', 'straw', 'strawUseless', 'straw3', 'straw4',
  'strawClosing',
  'expansionOpening', 'normalBreath', 'expansionInstruct'
];
const skipExpansion = params.get('skip-to') === 'power' || params.get('skip-to') === 'om';
const skipPower = params.get('skip-to') === 'om';
const skipEyesClosed = params.get('skip-eyes-closed') === 'true';
let yesState = null, currentGame;
async function startGame() {
  if (interruptInstructor) throw new Error('A game is still ongoing it seems.');
  stats = {
    startTime: Date.now(),
    runDistance: 0,
    breaths: 0,
    powerBreaths: 0,
    expansionBreaths: 0,
    checks: 0,
    fails: 0,
    codeEntries: 0
  };
  const {speak, interrupt} = speaking(instructorVoice);
  let haltForever = false, haltYES = false, doneWithYES = false;
  let animation = {type: 'instructor-start-walking', duration: 500, ended: false};
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
    if (!animation.ended) {
      const index = animations.indexOf(animation);
      if (~index) animations.splice(index, 1);
      instructor.walkOffsetTime = Date.now();
    }
  };
  if (!skipEyesClosed) await speak('eyesClosed');
  if (!haltYES) {
    animation.start = Date.now();
    animations.push(animation);
  }
  const sound = new THREE.Audio(listener);
  sound.setBuffer(sounds.lights);
  sound.play();
  toggleLights();
  setFaces(sleepyFace);
  instructor.face.map = creepyFace;
  playerState.canDie = true;
  setCanBreathe(true);
  addKeyHint('phone');
  addKeyHint('get-up');
  if (!skipExpansion) {
    for (const line of breathing) {
      if (haltYES) break;
      if (line === 'expansionOpening') {
        yesState = {type: 'expansion-ready'};
        addKeyHint('expansion');
      }
      await speak(line);
    }
    if (!haltYES) {
      yesState = {type: 'expansion', mode: 'up', start: Date.now(), first: true};
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
    const count = abridged === 'some' ? 1 : abridged === 'very' ? 0 : 3;
    for (let i = 0; i < count && !haltYES; i++) {
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
    for (let i = 0; i < count && !haltYES; i++) {
      yesState = {type: 'expansion', mode: 'up', start: Date.now()};
      await speak('breatheIn', 6000)
        && await speak('hold', 4000)
        && (yesState = {type: 'expansion', mode: 'down', start: Date.now()})
        && await speak('breatheOut', 6000)
        && await speak('hold', 2000);
    }
    yesState = null;
    removeKeyHint('expansion');
  }
  if (!skipPower) {
    if (!haltYES) {
      if (await speak('relaxLong') && await speak('powerKleenex1')) {
        addKeyHint('power');
        await speak('powerOpening');
      }
    }
    async function doPower() {
      yesState = {type: 'power-down', start: Date.now()};
      if (!haltYES) await speak('powerStart');
      for (let i = 0; i < POWER_REPS && !haltYES; i++) {
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
    removeKeyHint('power');
  }
  for (let i = 0; i < OMS && !haltYES; i++) {
    if (i > 0) await speak('omBreathe');
    if (!haltYES) {
      // TODO: adjust timings
      animations.push({type: 'intense-om', start: Date.now(), duration: 3000, anchorY: camera.position.y});
      await speak('om', 3000);
    }
  }
  if (haltYES) {
    if (!haltForever) {
      await speak('stopRunning');
    }
  } else {
    if (abridged) {
      totalStats.abridgedCompletions++;
      stats.winMode = 'abridged';
    } else {
      totalStats.completions++;
      stats.winMode = 'complete';
    }
    die();
    displayStats();
    instructor.moving = true;
    await new Promise(res => {
      const startPos = instructor.person.position.clone();
      const dest = cassette.parent.position.clone().setZ(-490);
      animations.push({
        type: 'run-to-cassette',
        start: Date.now(),
        duration: startPos.distanceTo(dest) / INSTRUCTOR_RUN_SPEED,
        done: res,
        startPos,
        dest,
        initCamRot: camera.rotation.clone()
      });
    });
    instructor.moving = false;
    instructor.limbs[2].limb.rotation.x = Math.PI;
    instructor.limbs[3].limb.rotation.x = Math.PI;
    instructor.limbs[2].forearm.rotation.x = 0;
    instructor.limbs[3].forearm.rotation.x = 0;
    cassette.play();
    doneWithYES = true;
    document.body.classList.remove('hide-end');
    document.body.classList.add('completed');
    document.exitPointerLock();
  }
  interruptInstructor = null;
}

const listener = new THREE.AudioListener();
camera.add(listener);

THREE.Cache.enabled = true;
const logLoadingProgress = params.get('log-loading') === 'true';
const manager = new THREE.LoadingManager();
const resourcesReady = new Promise(res => manager.onLoad = res);
let loadingBar;
manager.onProgress = (url, loaded, total) => {
  if (logLoadingProgress) console.log(url, loaded, total);
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
audioLoader.load('./sounds/floor-creak.mp3', buffer => sounds.creak = buffer);
audioLoader.load('./sounds/keypress.mp3', buffer => sounds.keypress = buffer);
audioLoader.load('./sounds/wrong.mp3', buffer => sounds.wrong = buffer);
audioLoader.load('./sounds/correct.mp3', buffer => sounds.correct = buffer);
audioLoader.load('./sounds/caught.mp3', buffer => sounds.caught = buffer);

const usingLambert = params.get('lambert') === 'true' || options.lambert;
const wireframe = params.get('wireframe') === 'true';
const gameMaterial = usingLambert ? (colour, emissive) => {
  return new THREE.MeshLambertMaterial({color: colour, emissive, wireframe});
} : (colour, emissive, roughness, metalness) => {
  return new THREE.MeshStandardMaterial({color: colour, emissive, roughness, metalness, wireframe});
};

const scene = new THREE.Scene();
scene.add(camera);

const onframe = [];
const collisionBoxes = [];
const {swap: toggleLights, isDark, darkPhongFloor, doors, cassette, lights, outsideLight, entranceDoors} = setupRoom(scene, onframe, collisionBoxes);
const {studentMap, instructor, instructorVoice, setFaces, addStudents} = loadPeople(scene, onframe);

const playerState = {phoneOut: false, pose: 'rest', canDie: false, jumpVel: null};
function setPose(pose) {
  document.body.classList.remove('indicate-' + playerState.pose);
  document.body.classList.add('indicate-' + pose);
  playerState.pose = pose;
}
const respire = limit(playerState.lungSize, -LUNG_RANGE + 1, LUNG_RANGE - 1);
function setCanBreathe(to) {
  if (playerState.canBreathe === to) return;
  playerState.canBreathe = to;
  if (to) {
    playerState.oxygen = MAX_OXYGEN;
    playerState.lungSize = 0;
    respire.set(playerState.lungSize);
    playerState.respireVel = 0;
    playerState.wasExhaling = false;
    setLungIndicator(playerState.oxygen / MAX_OXYGEN, playerState.lungSize / LUNG_RANGE);
    document.body.classList.remove('hide-lungs');
  } else {
    document.body.classList.add('hide-lungs');
  }
}
function isPlayerCatchworthy() {
  const now = Date.now();
  if (playerState.phoneOut) {
    return now - playerState.phoneOutSince > PHONE_LENIENCY_DELAY ? 'hide your phone' : 'tolerable';
  }
  if (yesState) {
    const time = now - yesState.start;
    switch (yesState.type) {
      case 'expansion': {
        const ok = yesState.first && time < EXPANSION_PREP_TIME;
        if (playerState.pose !== 'expansion') {
          return ok ? 'tolerable' : 'be ready for expansion breath';
        } else {
          const idealPos = Math.max(Math.min(time / 6000, 1), 0);
          const diff = Math.abs((yesState.mode === 'up' ? idealPos : 1 - idealPos) - playerState.position);
          if (diff > 0.2) {
            return !ok && time > EXPANSION_REACTION_TIME && diff > 0.5
              ? (yesState.mode === 'up' ? 'raise your arms at the right time' : 'lower your arms at the right time')
              : 'tolerable';
          }
        }
        break;
      }
      case 'power-down': {
        const ok = time < POWER_PREP_TIME;
        if (playerState.pose !== 'power') {
          return ok ? 'tolerable' : 'be ready for power breath';
        } else if (playerState.up) {
          return !ok && time > POWER_REACTION_TIME && time < 800 - POWER_EARLY_TIME ? 'raise your arms at the right time' : 'tolerable';
        }
        break;
      }
      case 'power-up': {
        const ok = time < POWER_PREP_TIME;
        if (playerState.pose !== 'power') {
          return ok ? 'tolerable' : 'be ready for power breath';
        } else if (!playerState.up) {
          return !ok && time > POWER_REACTION_TIME && time < 800 - POWER_EARLY_TIME ? 'lower your arms at the right time' : 'tolerable';
        }
        break;
      }
    }
  } else if (playerState.pose !== 'rest') {
    return 'tolerable';
  }
  return false;
}

const sittingPlayer = createPlayerSittingPerson();
sittingPlayer.person.position.set(camera.position.x, -5, MAT_FIRST_ROW_Z);

const phone = createPhone();
const phoneWrapper = new THREE.Group();
phoneWrapper.position.set(0.051712800199567255, 2.5974805742832814, 0.4137824638055463);
phoneWrapper.rotation.set(1.97030219, 1.10130276, 0.432667122); // TODO: this is an approximation
sittingPlayer.limbs[0].forearm.add(phoneWrapper);

function setPhoneState(to) {
  if (playerState.phoneOut === to) return;
  playerState.phoneOut = to;
  if (to) {
    if (moving === 'sitting') phoneWrapper.add(phone.phone);
    else phoneHand.add(phone.phone);
    resetLimbRotations(sittingPlayer, true, phoneRotations);
    setPose('phone');
    playerState.phoneOutSince = Date.now();
  } else {
    if (phone.phone.parent === phoneWrapper) phoneWrapper.remove(phone.phone);
    else phoneHand.remove(phone.phone);
    resetLimbRotations(sittingPlayer, true, restRotations);
    setPose('rest');
  }
}

const c = phone.canvas.getContext('2d');
c.fillStyle = '#BE1E2D';
c.fillRect(0, 0, 128, 30);
c.font = '15px monospace';
c.fillStyle = 'white';
c.fillText('Gunn admin MSG', 5, 25);
c.strokeStyle = 'black';
let code, codeChangeInterval, testedTunnelDoor;

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
  switch (selectedDoor.metadata.type) {
    case 'code': {
      if (internalCall && typeProgress.length >= CODE_LENGTH) {
        if (stats) stats.codeEntries++;
        if (typeProgress === code) {
          if (testedTunnelDoor && !selectedDoor.wrong) {
            totalStats.escapes++;
            die();
            stats.winMode = 'escape';
            displayStats();
            dc.fillStyle = '#00ff00';
            typingTimeout = setTimeout(() => {
              typeProgress = '';
              typingState = true;
              typingTimeout = null;
              selectedDoor.add(outsideLight);
              animations.push({
                type: 'open-doors',
                start: Date.now(),
                doors: selectedDoor,
                duration: 1000
              });
              selectedDoor.remove(doorPopup);
              selectedDoor = null;
            }, 1000);
            const beep = new THREE.Audio(listener);
            beep.setBuffer(sounds.correct);
            beep.play();
          } else {
            if (selectedDoor.metadata.tunnel) testedTunnelDoor = true;
            selectedDoor.wrong = true;
            dc.fillStyle = '#ff0000';
            dc.font = '20px sans-serif';
            dc.fillText('Try another door', 128, 5);
            const beep = new THREE.Audio(listener);
            beep.setBuffer(sounds.wrong);
            beep.play();
            break;
          }
        } else {
          dc.fillStyle = '#ff0000';
          const beep = new THREE.Audio(listener);
          beep.setBuffer(sounds.wrong);
          beep.play();
        }
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
      dc.fillText('Press 0–9 to enter keycode:', 128, 5);
      dc.font = '30px sans-serif';
      dc.fillText(typeProgress, 128, 30);
      if (!internalCall && typeProgress.length >= CODE_LENGTH) {
        typingState = false;
        typingTimeout = setTimeout(() => {
          renderDoorPopup(true);
        }, 500);
      }
      break;
    }
    case 'no code': {
      dc.fillStyle = '#ffff00';
      dc.font = '20px sans-serif';
      dc.fillText("The code won't work", 128, 5);
      dc.fillText("on this door", 128, 35);
      break;
    }
    case 'other door': {
      dc.fillStyle = '#ffff00';
      dc.font = '20px sans-serif';
      dc.fillText('Use the other door', 128, 5);
      break;
    }
    case 'no exit': {
      dc.fillStyle = '#ffff00';
      dc.font = '30px sans-serif';
      dc.fillText('Not an exit', 128, 5);
      break;
    }
  }
  doorPopupTexture.needsUpdate = true;
}

const logoTexture = loadTexture('./textures/yesnt-logo.png');
logoTexture.magFilter = THREE.NearestFilter;
logoTexture.minFilter = THREE.NearestFilter;
const logo = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(160, 80),
  new THREE.MeshBasicMaterial({
    map: logoTexture,
    transparent: true
  })
);
logo.position.set(0, 50, -499.9);

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

const hands = new THREE.Group();
hands.rotation.order = 'YXZ';
const phoneHand = new THREE.Group();
phoneHand.rotation.set(Math.PI / 2, 0, 0);
phoneHand.scale.multiplyScalar(0.5);
const lampHand = new THREE.Group();
lampHand.scale.multiplyScalar(0.1);
hands.add(phoneHand);
hands.add(lampHand);
scene.add(hands);
function calculateHandPositions() {
  const tempRotation = camera.rotation.clone();
  camera.rotation.set(0, 0, 0);
  camera.updateMatrixWorld();
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(-1, -1), camera);
  phoneHand.position.copy(
    camera.worldToLocal(
      new THREE.Ray(
        raycaster.ray.at(1, new THREE.Vector3()),
        raycaster.ray.direction.multiply(new THREE.Vector3(-1, -1, 1))
      ).at(0.2, new THREE.Vector3())));
  raycaster.setFromCamera(new THREE.Vector2(1, -1), camera);
  lampHand.position.copy(camera.worldToLocal(raycaster.ray.at(1, new THREE.Vector3())));
  camera.rotation.copy(tempRotation);
}
calculateHandPositions();

// new THREE.Mesh(
//   new THREE.SphereBufferGeometry(1),
//   new THREE.MeshBasicMaterial({color: 0x178262})
// )

window.addEventListener('resize', e => {
  document.body.style.display = 'none';
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  if (shaders) composer.setSize(width, height);
  calculateHandPositions();
  document.body.style.display = null;
});

let userInteracted;
const userInteraction = new Promise(res => userInteracted = res);

document.addEventListener('click', e => {
  if (!e.target.closest('.clickable')) {
    document.body.requestPointerLock();
    document.body.classList.add('hide-options');
  }
  userInteracted();
});
// slows down up to 1 out of bounds, so if min = -5, max = 5, then the range would be (-6, 6)
function limit(current, min, max) {
  let psuedocurrent = current;
  return {
    change(change) {
      psuedocurrent += change;
      if (psuedocurrent > max && change > 0) {
        return current = max + 1 - 1 / (1 + psuedocurrent - max);
      } else if (psuedocurrent < min && change < 0) {
        return current = min - 1 + 1 / (1 - psuedocurrent + min);
      } else {
        current += change;
        if (current > max) {
          psuedocurrent = max + 1 / (1 - current + max) - 1;
        } else if (current < min) {
          psuedocurrent = min + 1 - 1 / (1 + current - min);
        } else psuedocurrent = current;
        return current;
      }
    },
    set(to) {
      return psuedocurrent = current = to;
    }
  };
}
const MAX_ROTATION = Math.PI / 2;
const limitSittingHorizRot = limit(camera.rotation.y, -MAX_ROTATION, MAX_ROTATION);
function rotateCamera(deltaX, deltaY) {
  if (moving === 'chase') {
    camera.rotation.y -= deltaX;
  } else if (moving === 'sitting') {
    camera.rotation.y = limitSittingHorizRot.change(-deltaX);
  }
  if (moving !== 'caught') {
    camera.rotation.x -= deltaY;
    if (camera.rotation.x > Math.PI / 2) camera.rotation.x = Math.PI / 2;
    else if (camera.rotation.x < -Math.PI / 2) camera.rotation.x = -Math.PI / 2;
  }
}
document.addEventListener('mousemove', e => {
  if (document.pointerLockElement) {
    rotateCamera(e.movementX / options.sensitivity, e.movementY / options.sensitivity);
  }
});

const keys = {};
let keyHintText;
let keyHintIndex;
let keyHintTimeout;
let currentKeyHints;
function addKeyHint(keyHint, overwrite = false) {
  if (currentKeyHints.has(keyHint) && !overwrite) return;
  clearTimeout(keyHintTimeout);
  keyHintText.style.display = 'block';
  if (overwrite) {
    currentKeyHints = new Set([keyHint]);
    keyHintIndex = 0;
  } else {
    currentKeyHints.add(keyHint);
    keyHintIndex = currentKeyHints.size - 1;
  }
  showKeyHint();
}
// pass true to remove all
function removeKeyHint(keyHint) {
  if (keyHint !== true && !currentKeyHints.delete(keyHint)) return;
  clearTimeout(keyHintTimeout);
  if (keyHint !== true && currentKeyHints.size) {
    keyHintIndex = keyHintIndex % currentKeyHints.size;
    showKeyHint();
  } else {
    keyHintText.style.display = null;
    if (keyHint === true) currentKeyHints = new Set();
  }
}
function showKeyHint() {
  switch ([...currentKeyHints][keyHintIndex]) {
    case 'breathe':
      keyHintText.textContent = `Press ${options.keyNames[keyInputs['inhale'].dataset.keyCode].toUpperCase()} and ${options.keyNames[keyInputs['exhale'].dataset.keyCode].toUpperCase()} to inhale and exhale.`;
      break;
    case 'skip-intro':
      keyHintText.textContent = `Press ${options.keyNames[keyInputs['skip-intro'].dataset.keyCode].toUpperCase()} to skip the intro.`;
      break;
    case 'phone':
      keyHintText.textContent = `Press ${options.keyNames[keyInputs['phone'].dataset.keyCode].toUpperCase()} to take out your phone.`;
      break;
    case 'get-up':
      keyHintText.textContent = `Press ${options.keyNames[keyInputs['get-up'].dataset.keyCode].toUpperCase()} to get up and move.`;
      break;
    case 'expansion':
      keyHintText.textContent = `Hold ${options.keyNames[keyInputs['exp-up'].dataset.keyCode].toUpperCase()} and ${options.keyNames[keyInputs['exp-down'].dataset.keyCode].toUpperCase()} to raise and lower your arms for expansion breath.`;
      break;
    case 'power':
      keyHintText.textContent = `Press ${options.keyNames[keyInputs['power-up'].dataset.keyCode].toUpperCase()} and ${options.keyNames[keyInputs['power-down'].dataset.keyCode].toUpperCase()} to raise and lower your arms for power breath.`;
      break;
    case 'move':
      keyHintText.textContent = 'Press '
        + options.keyNames[keyInputs.forth.dataset.keyCode].toUpperCase() + ', '
        + options.keyNames[keyInputs.left.dataset.keyCode].toUpperCase() + ', '
        + options.keyNames[keyInputs.back.dataset.keyCode].toUpperCase() + ', and '
        + options.keyNames[keyInputs.right.dataset.keyCode].toUpperCase()
        + ' to move around.';
      break;
    case 'pick-up':
      keyHintText.textContent = `Press ${options.keyNames[keyInputs['pick-up'].dataset.keyCode].toUpperCase()} to pick up the light.`;
      break;
    case 'type':
      keyHintText.textContent = `Type the keycode using the 0–9 keys.`;
      break;
    default:
      console.warn([...currentKeyHints][keyHintIndex]);
  }
  if (currentKeyHints.size > 1) {
    keyHintIndex = (keyHintIndex + 1) % currentKeyHints.size;
    keyHintTimeout = setTimeout(showKeyHint, KEY_HINT_CYCLE_SPEED);
  }
}
const onKeyPress = {
  phone() {
    if (moving !== 'sitting' && moving !== 'chase') return;
    if (!playerState.canDie) {
      hintText.textContent = "You should take out your phone when it's dark so they won't notice.";
      animations.push({type: 'flash-hint', start: Date.now(), duration: 5000});
      return;
    }
    setPhoneState(!playerState.phoneOut);
  },
  reset() {
    if (!playerState.canDie) return;
    if (playerState.phoneOut) setPhoneState(false);
    if (playerState.pose !== 'rest') {
      resetLimbRotations(sittingPlayer, true, restRotations);
      setPose('rest');
    }
  },
  'get-up'() {
    if (moving !== 'sitting') return;
    if (!playerState.canDie) {
      hintText.textContent = "You should get up when it's dark so they won't notice.";
      animations.push({type: 'flash-hint', start: Date.now(), duration: 5000});
      return;
    }
    moving = 'chase';
    hands.rotation.set(-Math.PI / 4, 0, 0);
    if (playerState.phoneOut) phoneHand.add(phone.phone);
    scene.remove(sittingPlayer.person);
    for (let i = animations.length - 1; i >= 0; i--) {
      if (animations[i].type === 'intense-om') animations.splice(i, 1);
    }
    animations.push({type: 'get-up', start: Date.now(), duration: 200});
    instructor.moving = 'chase';
    instructor.head.rotation.y = 0;
    instructor.limbs[0].limb.rotation.x = instructor.limbs[1].limb.rotation.x = Math.PI * 1.4;
    instructor.limbs[0].forearm.rotation.x = instructor.limbs[1].forearm.rotation.x = Math.PI * 0.1;
    if (interruptInstructor) interruptInstructor('getting up');
    addKeyHint('phone', true);
    addKeyHint('breathe');
    addKeyHint('move');
    document.body.classList.add('hide-pose');
    const sound = new THREE.Audio(listener);
    sound.setBuffer(sounds.creak);
    sound.setVolume(0.05);
    sound.play();
  },
  'skip-intro'() {
    if (skipIntro) skipIntro();
  },
  'del-code-digit'() {
    if (selectedDoor && typingState) {
      typeProgress = typeProgress.slice(0, -1);
      renderDoorPopup();
      const beep = new THREE.Audio(listener);
      beep.setBuffer(sounds.keypress);
      beep.play();
    }
  },
  'power-down'() {
    if (moving !== 'sitting') return;
    if (stats && playerState.pose === 'power' && playerState.up) {
      stats.powerBreaths++;
    }
    if (playerState.phoneOut) setPhoneState(false);
    setPose('power');
    document.body.classList.remove('indicate-power-up');
    document.body.classList.add('indicate-power-down');
    playerState.up = false;
    resetLimbRotations(sittingPlayer, true, powerBreathDown);
  },
  'power-up'() {
    if (moving !== 'sitting') return;
    if (playerState.phoneOut) setPhoneState(false);
    setPose('power');
    document.body.classList.remove('indicate-power-down');
    document.body.classList.add('indicate-power-up');
    playerState.up = true;
    resetLimbRotations(sittingPlayer, true, powerBreathUp);
  },
  'pick-up'() {
    if (lampHand.children.length) {
      hintText.textContent = 'You feel too attached to the light to let it go.';
      animations.push({type: 'flash-hint', start: Date.now(), duration: 5000});
    }
  },
  trip() {
    if (moving !== 'chase') return;
    die();
    playerState.jumpVel = 5;
  }
};
document.addEventListener('pointerlockchange', e => {
  if (!document.pointerLockElement) {
    document.body.classList.remove('hide-options');
  }
});
document.addEventListener('keydown', e => {
  const keyFn = options.controls[e.keyCode];
  if (document.pointerLockElement) {
    if (keyFn) {
      keys[keyFn] = true;
      if (onKeyPress[keyFn]) onKeyPress[keyFn]();
    }
    e.preventDefault();
  } else if (document.activeElement && document.activeElement.classList.contains('key-input')) {
    const keyInput = document.activeElement;
    if (keyFn) {
      if (!keyInput.classList.contains('duplicate-key')) {
        keyInput.classList.add('duplicate-key');
        setTimeout(() => {
          keyInput.classList.remove('duplicate-key');
        }, 200);
      }
    } else {
      delete options.controls[keyInput.dataset.keyCode];
      options.controls[e.keyCode] = keyInput.dataset.fn;
      keyInput.textContent = options.keyNames[e.keyCode] = e.key === ' ' ? 'Space' : e.key;
      options.controls.default = false;
      keyInput.blur();
      saveOptions();
    }
    e.preventDefault();
  }
});
document.addEventListener('keyup', e => {
  const key = options.controls[e.keyCode];
  if (document.pointerLockElement) {
    if (key) keys[key] = false;
    e.preventDefault();
  }
});
for (let i = 0; i < 10; i++) {
  options.controls[i + 48] = i + '';
  onKeyPress[i] = () => {
    if (selectedDoor && typingState) {
      typeProgress += i;
      renderDoorPopup();
      const beep = new THREE.Audio(listener);
      beep.setBuffer(sounds.keypress);
      beep.play();
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

function die() {
  instructor.moving = false;
  setCanBreathe(false);
  moving = 'caught';
  if (interruptInstructor) interruptInstructor('caught');
  playerState.canDie = false;
  stats.accuracy = 1 - stats.fails / stats.checks;
  stats.duration = Date.now() - stats.startTime;
  saveStats(stats);
}
function caught() {
  die();
  const headPos = instructor.head.getWorldPosition(new THREE.Vector3());
  camera.lookAt(headPos);
  instructor.head.lookAt(camera.position);
  instructor.head.rotation.y += Math.PI;
  document.body.style.backgroundColor = 'red';
  animations.push({
    type: 'intensify',
    start: Date.now(),
    duration: 2000,
    zoomIntensity: camera.position.distanceTo(headPos) / 20,
    anchorY: camera.position.y
  });
  const sound = new THREE.Audio(listener);
  sound.setBuffer(sounds.caught);
  sound.play();
}
let deathReason;
function youFailedTo(failure, delay = 2) {
  deathReason.textContent = failure;
  deathReason.parentNode.style.transitionDelay = delay + 's';
  deathReason.parentNode.style.maxWidth = null;
  deathReason.parentNode.classList.add('hide-death-note');
  deathReason.parentNode.style.maxWidth = deathReason.parentNode.scrollWidth + 'px';
  deathReason.parentNode.classList.remove('hide-death-note');
}

let lungIndicator;
/**
 * @param {number} oxygen 0 - 1
 * @param {number} volume -1 - 1
 */
function setLungIndicator(oxygen, volume) {
  lungIndicator.style.setProperty('--blood', `hsl(0, ${100 - oxygen * 25}%, ${oxygen * 50}%)`);
  lungIndicator.style.setProperty('--size', (volume * 20 + 50) + 'px');
  lungIndicator.style.setProperty('--icon-size', (volume * 5 + 30) + 'px');
}

const reminderMessages = [
  "Don't forget to breathe!",
  'Need breath',
  'Respiration required',
  'Your cells desire oxygen!',
  'Breathe!'
];
function remindUserToBreathe() {
  const wrapper = document.createElement('div');
  wrapper.classList.add('reminder-to-breathe');
  const reminder = document.createElement('span');
  reminder.textContent = reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
  reminder.addEventListener('animationend', e => {
    document.body.removeChild(wrapper);
  }, {once: true});
  wrapper.appendChild(reminder);
  document.body.appendChild(wrapper);
}

let hintText;
let lastTime, moving;
const keyInputs = {};
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
          if (!interruptInstructor) {
            start();
            currentGame = startGame();
          }
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
        case 'black-out': {
          renderer.domElement.style.opacity = null;
          camera.zoom = 1;
          camera.updateProjectionMatrix();
          if (animation.restart) {
            if (!interruptInstructor) {
              start();
              currentGame = startGame();
            }
          } else {
            setCanBreathe(true);
            animations.push({type: 'start', start: now, duration: 1000});
          }
          break;
        }
        case 'hide-cant-jump': {
          document.body.classList.add('hide-cant-jump');
          start();
          currentGame = startGame();
          break;
        }
        case 'open-doors': {
          document.body.style.backgroundColor = 'white';
          animations.push({
            type: 'into-the-light',
            start: now,
            doors: animation.doors,
            initialPlayerX: camera.position.x,
            initialPlayerZ: camera.position.z,
            finalPlayerX: animation.doors.position.x,
            finalPlayerZ: animation.doors.position.z,
            duration: 2000
          });
          break;
        }
        case 'into-the-light': {
          animation.doors.remove(outsideLight);
          animation.doors.left.rotation.y = 0;
          animation.doors.right.rotation.y = Math.PI;
          document.body.classList.remove('hide-end');
          document.body.classList.add('escaped');
          renderer.domElement.style.opacity = null;
          document.body.style.backgroundColor = null;
          document.exitPointerLock();
          break;
        }
        case 'camera-pan': {
          break;
        }
        case 'instructor-start-walking': {
          instructor.moving = 'watch';
          instructor.walkOffsetTime = now;
          animation.ended = true;
          break;
        }
        case 'run-to-cassette': {
          instructor.person.position.copy(animation.dest);
          instructor.person.rotation.y = 0;
          instructor.head.rotation.x = -0.2;
          camera.lookAt(instructor.person.position.clone().setY(11));
          animation.done();
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
        case 'black-out': {
          const position = easeOutCubic(progress);
          renderer.domElement.style.opacity = 0.5 - position / 2;
          camera.zoom = 1 / (1 + position * 3);
          camera.updateProjectionMatrix();
          break;
        }
        case 'open-doors': {
          const position = easeOutCubic(progress);
          animation.doors.left.rotation.y = -Math.PI / 2 * position;
          animation.doors.right.rotation.y = Math.PI + Math.PI / 2 * position;
          break;
        }
        case 'into-the-light': {
          const position = easeInCubic(progress);
          camera.position.x = position * (animation.finalPlayerX - animation.initialPlayerX) + animation.initialPlayerX;
          camera.position.z = position * (animation.finalPlayerZ - animation.initialPlayerZ) + animation.initialPlayerZ;
          renderer.domElement.style.opacity = 1 - position;
          break;
        }
        case 'camera-pan': {
          const prog = (now - animation.start) / animation.actualDuration;
          camera.position.x = animation.from.x + (animation.to.x - animation.from.x) * prog;
          camera.position.y = animation.from.y + (animation.to.y - animation.from.y) * prog;
          camera.position.z = animation.from.z + (animation.to.z - animation.from.z) * prog;
          camera.rotation.z = animation.roll * (1 - 2 * prog);
          break;
        }
        case 'start-screen-pan': {
          let prog = easeOutCubic((now - animation.start) / animation.actualDuration);
          if (prog > 1) {
            camera.position.y = Math.random() * 30 + 10;
            animation.startAngle = Math.random() * Math.PI;
            animation.deltaAngle = Math.random() * Math.PI - animation.startAngle;
            animation.actualDuration = Math.abs(animation.deltaAngle) * 3000 + 1000;
            animation.startRadius = Math.random() * 100 + 10;
            animation.deltaRadius = Math.random() * 100 + 10 - animation.startRadius;
            animation.start = now;
            prog = 0;
          }
          const angle = animation.startAngle + prog * animation.deltaAngle;
          const radius = animation.startRadius + prog * animation.deltaRadius;
          camera.position.x = Math.cos(angle) * radius;
          camera.position.z = instructor.person.position.z + Math.sin(angle) * radius;
          camera.lookAt(animation.lookTarget);

          instructor.head.rotation.y = Math.sin(now / 1000) * 0.5;
          instructor.person.position.y = (Math.cos(now / 200) - 1) * 1.5;
          instructor.limbs[2].limb.rotation.x = Math.PI + (1 - Math.cos(now / 200)) * 0.5;
          instructor.limbs[2].forearm.rotation.x = Math.cos(now / 200) - 1;
          instructor.limbs[3].limb.rotation.x = Math.PI + (1 - Math.cos(now / 200)) * 0.5;
          instructor.limbs[3].forearm.rotation.x = Math.cos(now / 200) - 1;
          break;
        }
        case 'instructor-start-walking': {
          const position = easeOutCubic(progress);
          instructor.person.rotation.y = Math.PI + position * Math.PI / 2;
          instructor.head.rotation.y = -position * Math.PI / 4;
          break;
        }
        case 'run-to-cassette': {
          instructor.person.position.x = progress * (animation.dest.x - animation.startPos.x) + animation.startPos.x;
          instructor.person.position.z = progress * (animation.dest.z - animation.startPos.z) + animation.startPos.z;
          instructor.person.rotation.y = Math.atan2(animation.startPos.x - animation.dest.x, animation.startPos.z - animation.dest.z);
          instructor.head.rotation.x = progress * -0.2;
          camera.lookAt(instructor.person.position.clone().setY(11));
          if (progress < 0.5) {
            const pos = easeOutCubic(progress * 2);
            camera.rotation.x = animation.initCamRot.x + pos * (camera.rotation.x - animation.initCamRot.x);
            camera.rotation.y = animation.initCamRot.y + pos * (camera.rotation.y - animation.initCamRot.y);
          }
          break;
        }
      }
    }
  }

  let speed = 0;
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
    speed = movement.length();
    movement.multiplyScalar(MOVEMENT_SPEED * elapsedTime);

    const matX = Math.round(camera.position.x / (MAT_WIDTH + MAT_SPACING));
    const matZ = Math.round((camera.position.z - MAT_FIRST_ROW_Z) / (MAT_LENGTH + MAT_SPACING));
    const studentX = matX * (MAT_WIDTH + MAT_SPACING);
    const studentZ = matZ * (MAT_LENGTH + MAT_SPACING) + MAT_FIRST_ROW_Z;
    const stagger = matX % 2 === 0 ? -STAGGER_DISTANCE : STAGGER_DISTANCE;
    const rects = [...collisionBoxes];
    if (studentMap[`${matX},${matZ}`]) {
      rects.push([
        studentX - STUDENT_X_RADIUS,
        studentX + STUDENT_X_RADIUS,
        studentZ - STUDENT_FRONT_SIZE + stagger,
        studentZ + STUDENT_BACK_SIZE + stagger
      ]);
    }

    const oldPos = camera.position.clone();

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
    rects.forEach(([minX, maxX, minZ, maxZ, obj]) => {
      if (obj && obj.parent !== lights.get(obj)) return;
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
    rects.forEach(([minX, maxX, minZ, maxZ, obj]) => {
      if (obj && obj.parent !== lights.get(obj)) return;
      if (camera.position.x > minX && camera.position.x < maxX) {
        if (camera.position.z > minZ && camera.position.z < maxZ) {
          if (movement.z > 0) camera.position.z = minZ;
          else camera.position.z = maxZ;
        }
      }
    });

    if (stats) {
      stats.runDistance += Math.hypot(camera.position.x - oldPos.x, camera.position.z - oldPos.z);
    }

    if (lampHand.children.length === 0) {
      const xz = camera.position.clone().setY(0);
      let selectedLight;
      for (const light of lights.keys()) {
        if (xz.distanceToSquared(light.parent.position) <= light.radius * light.radius) {
          selectedLight = light;
          break;
        }
      }
      if (selectedLight) {
        if (keys['pick-up']) {
          lampHand.add(selectedLight);
        } else if (!playerState.showedPickupHint) {
          addKeyHint('pick-up');
          playerState.showedPickupHint = true;
        }
      } else if (playerState.showedPickupHint) {
        removeKeyHint('pick-up');
        playerState.showedPickupHint = false;
      }
    }

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
        if (selectedDoor.metadata.type === 'code') {
          typeProgress = '';
          typingState = true;
        } else {
          typingState = false;
        }
        renderDoorPopup();
      }
    } else if (selectedDoor) {
      if (typingTimeout) clearTimeout(typingTimeout);
      selectedDoor.remove(doorPopup);
      selectedDoor = null;
    }

    hands.position.copy(camera.position);
    const change = 1 - (2 / 3) ** (elapsedTime / 15);
    hands.rotation.x += (camera.rotation.x - hands.rotation.x) * change;
    hands.rotation.y += (camera.rotation.y - hands.rotation.y) * change;

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
      youFailedTo('outrun the instructor');
      caught();
    }
  } else if (moving === 'sitting') {
    const instructorDirection = instructor.head.getWorldDirection(new THREE.Vector3()).setY(0);
    const playerDirection = instructor.person.position.clone().sub(camera.position).setY(0);
    if (keys['exp-down'] || keys['exp-up']) {
      if (playerState.pose !== 'expansion') {
        if (playerState.phoneOut) setPhoneState(false);
        resetLimbRotations(sittingPlayer, true, defaultExpansionRotations);
        setPose('expansion');
        playerState.position = 0;
      }
      if (keys['exp-down']) {
        playerState.position -= EXPANSION_SPEED * elapsedTime;
        if (playerState.needsDown && playerState.position < 0.2) {
          playerState.needsDown = false;
          if (stats) stats.expansionBreaths++;
        }
      }
      if (keys['exp-up']) {
        playerState.position += EXPANSION_SPEED * elapsedTime;
        if (!playerState.needsDown && playerState.position > 0.8) {
          playerState.needsDown = true;
        }
      }
      if (playerState.position < 0) playerState.position = 0;
      else if (playerState.position > 1) playerState.position = 1;
      sittingPlayer.limbs[0].limb.idealRot.z = playerState.position * (Math.PI - 0.2) + 0.1;
      sittingPlayer.limbs[1].limb.idealRot.z = -playerState.position * (Math.PI - 0.2) - 0.1;
      document.body.style.setProperty('--expansion', playerState.position * 180 - 90 + 'deg');
    }
    const reason = isPlayerCatchworthy();
    if (stats) {
      stats.checks++;
      if (reason) stats.fails++;
    }
    if (checkPlayer ? instructorDirection.angleTo(playerDirection) < Math.PI * 0.2 : alwaysCheckPlayer) {
      if (reason && reason !== 'tolerable') {
        youFailedTo(reason);
        caught();
      }
    }
  } else if (playerState.jumpVel !== null) {
    playerState.jumpVel -= 0.5 * elapsedTime / 60;
    camera.position.y += playerState.jumpVel * elapsedTime / 60;
    hands.position.y += (camera.position.y - hands.position.y) * (1 - 0.1 ** (elapsedTime / 15));
    if (camera.position.y < 1) {
      youFailedTo('land a jump');
      document.body.classList.remove('hide-cant-jump');
      animations.push({
        type: 'hide-cant-jump',
        start: now,
        duration: 2000
      });
      playerState.jumpVel = null;
    }
  }

  if (playerState.canBreathe) {
    const wasDying = playerState.oxygen < LOW_OXYGEN;
    if (loseOxygen) {
      playerState.oxygen -= LIVING_OXYGEN_USAGE * elapsedTime;
      playerState.oxygen -= RUNNING_OXYGEN_USAGE * elapsedTime * speed;
    }
    playerState.respireVel *= 0.8;
    if (keys.inhale) {
      if (playerState.wasExhaling && !keys.exhale) {
        playerState.wasExhaling = false;
        if (stats) stats.breaths++;
      }
      if (!keys._inhaleWasDown) {
        playerState.respireVel += BREATHING_BOOST_SPEED;
        keys._inhaleWasDown = true;
      }
      playerState.respireVel += BREATHING_SPEED * elapsedTime;
    } else keys._inhaleWasDown = false;
    if (keys.exhale) {
      if (!playerState.wasExhaling && !keys.inhale) {
        playerState.wasExhaling = true;
      }
      if (!keys._exhaleWasDown) {
        playerState.respireVel -= BREATHING_BOOST_SPEED;
        keys._exhaleWasDown = true;
      }
      playerState.respireVel -= BREATHING_SPEED * elapsedTime;
    } else keys._exhaleWasDown = false;
    const oldLungSize = playerState.lungSize;
    playerState.lungSize = respire.change(playerState.respireVel * elapsedTime);
    if (playerState.respireVel > 0) {
      playerState.oxygen += INHALE_OXYGEN_SPEED * (playerState.lungSize - oldLungSize);
      if (playerState.oxygen > MAX_OXYGEN) playerState.oxygen = MAX_OXYGEN;
    }
    setLungIndicator(playerState.oxygen / MAX_OXYGEN, playerState.lungSize / LUNG_RANGE);
    if (playerState.oxygen < ASPHYXIATION) {
      if (playerState.canAsphyxiate) {
        youFailedTo('breathe', 1);
        die();
      } else {
        setCanBreathe(false);
      }
      animations.push({
        type: 'black-out',
        start: now,
        duration: 1000,
        restart: playerState.canAsphyxiate
      });
    } else if (playerState.oxygen < LOW_OXYGEN) {
      const percentToDeath = (playerState.oxygen - ASPHYXIATION) / (LOW_OXYGEN - ASPHYXIATION);
      renderer.domElement.style.opacity = percentToDeath / 2 + 0.5;
      if (playerState.lastLowOxygen) {
        if (now - playerState.lastLowOxygen > 3000 * percentToDeath * percentToDeath + 50) {
          remindUserToBreathe();
          playerState.lastLowOxygen = now;
        }
      } else {
        removeKeyHint('breathe');
        addKeyHint('breathe');
        remindUserToBreathe();
        playerState.lastLowOxygen = now;
      }
    } else if (wasDying) {
      renderer.domElement.style.opacity = null;
      playerState.lastLowOxygen = null;
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
  lungIndicator = document.getElementById('lung-indicator');
  keyHintText = document.getElementById('key-hint');
  deathReason = document.getElementById('death-reason');
  statTable = document.getElementById('stattable');
  totalStatTable = document.getElementById('total-stattable');
  usernameInput = document.getElementById('username');
  urlInput = document.getElementById('url');
  problemMessage = document.getElementById('problem');
  submitScoreBtn = document.getElementById('submit-score');
  leaderboard = document.getElementById('leaderboard');
  displayTotalStats();

  if (window.location.search.length > 1) {
    document.body.classList.remove('hide-dev');
    problemMessage.classList.remove('hidden');
    problemMessage.textContent = 'You cannot submit scores in development mode.';
    // usernameInput.disabled = true;
    // urlInput.disabled = true;
    // submitScoreBtn.disabled = true;
  }

  usernameInput.addEventListener('keypress', e => {
    if (badNameRegex.test(e.key)) {
      e.preventDefault();
    }
  });
  submitScoreBtn.addEventListener('click', e => {
    let problems = '';
    if (usernameInput.value.length !== 3) {
      problems += 'Name not three characters long.\n';
    }
    if (badNameRegex.test(usernameInput.value)) {
      problems += 'Name has non-alphanumerical characters.\n'
    }
    if (urlInput.value && !urlRegex.test(urlInput.value)) {
      problems += 'Weird URL.\n';
    }
    if (problems) {
      problemMessage.classList.remove('hidden');
      problemMessage.textContent = problems;
    } else {
      submitScoreBtn.disabled = true;
      const winMode = stats.winMode; // in case it changes later on
      const mode = winMode === 'escape' ? 'escaped'
        : winMode === 'complete' ? 'completed' : 'abridged';
      fetch('https://test-9d9aa.firebaseapp.com/yesntScores?leaderboard=' + mode, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          name: usernameInput.value.toUpperCase(),
          url: urlInput.value,
          duration: stats.duration,
          breaths: stats.breaths,
          ...(winMode === 'escape' ? {
            distance: stats.runDistance,
            codeEntries: stats.codeEntries
          } : {
            powers: stats.powerBreaths,
            expands: stats.expansionBreaths,
            accuracy: stats.accuracy
          })
        })
      })
        .then(r => r.ok ? r.text() : r.text().then(msg => Promise.reject(msg)))
        .then(id => {
          const ids = localStorage.getItem('[yesnt] submitted');
          localStorage.setItem('[yesnt] submitted', ids ? id : ids + ' ' + id);
          fetch('https://test-9d9aa.firebaseapp.com/yesntScores?leaderboard=' + mode)
            .then(r => r.ok ? r.json() : r.text().then(content => Promise.reject(content)))
            .then(leaderboard => {
              const success = displayLeaderboard(
                winMode === 'escaped'
                  ? leaderboard.sort((a, b) => a.duration - b.duration)
                  : leaderboard.sort((a, b) => b.accuracy - a.accuracy),
                [
                  ['index', '#', 'Position'],
                  ['name', 'NAM', 'Name/URL'],
                  ['duration', 'DUR', 'Length of gameplay'],
                  ['breaths', 'BTH', 'Times breathed'],
                  ...(winMode === 'escaped' ? [
                    ['distance', 'DIS', 'Distance run'],
                    ['codeEntries', 'TRY', 'Code entries tried']
                  ] : [
                    ['powers', 'POW', 'Power breaths performed'],
                    ['expands', 'XPD', 'Expansion breaths performed'],
                    ['accuracy', 'ACC', 'Percent accuracy']
                  ])
                ],
                id
              );
              if (success === 'ok') {
                problemMessage.classList.add('hidden');
              } else {
                problemMessage.classList.remove('hidden');
                problemMessage.textContent = 'Could not find the score you just submitted. Oof!';
              }
            })
            .catch(err => {
              problemMessage.classList.remove('hidden');
              problemMessage.textContent = 'There was a problem fetching the leaderboard:\n' + err;
            });
        })
        .catch(err => {
          problemMessage.classList.remove('hidden');
          problemMessage.textContent = 'There was a problem submitting the score:\n' + err;
          submitScoreBtn.disabled = false;
        });
    }
  });

  const fovSlider = document.getElementById('fov');
  const fovValue = document.getElementById('fov-val');
  fovValue.textContent = fovSlider.value = options.fov;
  fovSlider.addEventListener('input', e => {
    fovValue.textContent = camera.fov = options.fov = +fovSlider.value;
    camera.updateProjectionMatrix();
    saveOptions();
  });

  const sensitivitySlider = document.getElementById('sensitivity');
  sensitivitySlider.value = Math.log10(options.sensitivity);
  sensitivitySlider.addEventListener('input', e => {
    options.sensitivity = Math.pow(10, +sensitivitySlider.value);
    saveOptions();
  });

  const touchSensitivitySlider = document.getElementById('touch-sensitivity');
  touchSensitivitySlider.value = Math.log10(options.touchSensitivity);
  touchSensitivitySlider.addEventListener('input', e => {
    options.touchSensitivity = Math.pow(10, +touchSensitivitySlider.value);
    saveOptions();
  });

  const functionToKey = {};
  Object.keys(options.controls).forEach(key => functionToKey[options.controls[key]] = key);
  Array.from(document.getElementsByClassName('key-input'), keyInput => {
    keyInput.dataset.keyCode = functionToKey[keyInput.dataset.fn];
    keyInput.textContent = options.keyNames[functionToKey[keyInput.dataset.fn]];
    keyInputs[keyInput.dataset.fn] = keyInput;
  });

  document.getElementById('reset-settings').addEventListener('click', e => {
    options = JSON.parse(JSON.stringify(defaultOptions));
    fovValue.textContent = fovSlider.value = camera.fov = options.fov;
    camera.updateProjectionMatrix();
    sensitivitySlider.value = Math.log10(options.sensitivity);
    touchSensitivitySlider.value = Math.log10(options.touchSensitivity);
    const functionToKey = {};
    Object.keys(options.controls).forEach(key => functionToKey[options.controls[key]] = key);
    Array.from(document.getElementsByClassName('key-input'), keyInput => {
      keyInput.dataset.keyCode = functionToKey[keyInput.dataset.fn];
      keyInput.textContent = options.keyNames[functionToKey[keyInput.dataset.fn]];
    });
    saveOptions();
  });

  function restart() {
    if (skipIntro) return skipIntro();
    die();
    document.body.classList.add('hide-end');
    animations.forEach(anim => {
      anim.duration = 0;
    });
    Promise.resolve(currentGame).then(() => {
      start();
      currentGame = startGame();
    });
  }
  document.getElementById('restart').addEventListener('click', restart);
  document.getElementById('play-again').addEventListener('click', restart);

  document.body.appendChild(renderer.domElement);
  initTouch();

  lastTime = Date.now();
  // renderer.domElement.style.opacity = 0;
  let currentAnimation = null;
  camera.position.set(0, 5, -350);
  camera.rotation.x = -0.1;
  scene.add(logo);
  start(true);
  instructor.head.parent.updateMatrixWorld();
  animations.push(currentAnimation = {
    type: 'start-screen-pan',
    start: Date.now(),
    duration: Infinity,
    actualDuration: 3000,
    startAngle: Math.PI / 2,
    deltaAngle: 0,
    startRadius: 500,
    deltaRadius: -480,
    lookTarget: instructor.head.getWorldPosition(new THREE.Vector3())
  });
  animate();
  Promise.all([
    resourcesReady.then(() => {
      if (logLoadingProgress) console.log('loading done');
      loadingBar.classList.add('hide-bar');
    }),
    initSpeech()
  ]).then(async () => {
    scene.remove(logo);
    currentAnimation.duration = 0;
    instructor.person.position.y = 0;
    instructor.limbs[2].limb.rotation.x = Math.PI;
    instructor.limbs[2].forearm.rotation.x = 0;
    instructor.limbs[3].limb.rotation.x = Math.PI;
    instructor.limbs[3].forearm.rotation.x = 0;
    document.body.classList.add('hide-note');
    addStudents();
    start();
    let dontContinue = false;
    skipIntro = () => {
      interrupt();
      dontContinue = true;
      if (currentAnimation) currentAnimation.duration = 0;
    };

    document.body.classList.add('hide-pose');
    sittingPlayer.head.visible = true;
    instructor.person.rotation.y = -Math.PI / 2;
    instructor.person.position.x = 20;
    selectedDoor = entranceDoors[1];
    selectedDoor.add(doorPopup);
    typeProgress = '';
    renderDoorPopup();
    // NOTE: phone is only put in hand when moving is 'sitting'
    setPhoneState(true);
    moving = 'caught';
    const narrator = new THREE.Audio(listener);
    let {speak, interrupt} = speaking(narrator);
    animations.push(currentAnimation = {
      type: 'camera-pan',
      start: Date.now(),
      duration: Infinity,
      actualDuration: 4000,
      setTrack(from, to, roll) {
        currentAnimation.start = Date.now();
        from = new THREE.Vector3(...from);
        to = new THREE.Vector3(...to);
        currentAnimation.from = from;
        currentAnimation.to = to;
        currentAnimation.roll = roll;
        camera.position.copy(from);
        camera.lookAt(to);
        camera.rotation.z = roll;
      }
    });
    currentAnimation.setTrack([-150, 30, -350], [-15, 15, -440], -0.2);
    addKeyHint('skip-intro');
    if (!dontContinue) await speak('intro1');
    currentAnimation.setTrack([5, 10, -447], [1, 5, -452], 0.1);
    addKeyHint('phone');
    if (!dontContinue) await speak('intro2');
    currentAnimation.setTrack([-310, 15, -300], [-330, 12, -300], -0.05);
    addKeyHint('type');
    if (!dontContinue) await speak('intro3');
    currentAnimation.duration = 0;
    sittingPlayer.head.visible = false;
    // start doesn't reset this apparently; people.js does for animating her walking up and down
    instructor.person.position.x = 0;
    instructor.person.rotation.y = Math.PI;
    document.body.classList.remove('hide-pose');

    start();
    setCanBreathe(true);
    playerState.canAsphyxiate = false;
    moving = 'sitting';

    addKeyHint('skip-intro');
    addKeyHint('breathe');
    ({speak, interrupt} = speaking(instructorVoice));
    if (dontContinue) interrupt();
    for (const line of intro) {
      if (dontContinue) break;
      if (line === 'introExpansion1') {
        addKeyHint('expansion');
        await Promise.all([
          speak('introExpansion1'),
          new Promise(res => {
            resetLimbRotations(instructor, true, defaultExpansionRotations);
            animations.push(currentAnimation = {type: 'show-expansion', start: Date.now(), duration: 5000, onDone: res});
          })
        ]);
        removeKeyHint('expansion');
        currentAnimation = null;
      } else if (line === 'introPower1') {
        addKeyHint('power');
        await Promise.all([
          speak('introPower1'),
          new Promise(res => {
            animations.push(currentAnimation = {type: 'show-power', start: Date.now(), duration: 2000, onDone: res});
          })
        ]);
        removeKeyHint('power');
        currentAnimation = null;
      } else {
        await speak(line);
      }
    }
    removeKeyHint('skip-intro');
    skipIntro = null;
    if (params.get('stay-intro') !== 'true') {
      playerState.canAsphyxiate = true;
      currentGame = startGame();
    }
  });
});
