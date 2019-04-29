const LIMB_WIDTH = 0.5;
const SLEEVE_OFFSET = 0.1;
const SLEEVE_WIDTH = 0.7;
const STAGGER_DISTANCE = 2;
function createLimb(limbLength, skinColour, sleeveLength = 0, sleeveColour = 0xffffff) {
  const limb = new THREE.Group();
  if (sleeveLength) {
    const sleeve = new THREE.Mesh(
      new THREE.BoxBufferGeometry(SLEEVE_WIDTH, sleeveLength, SLEEVE_WIDTH),
      new THREE.MeshStandardMaterial({color: sleeveColour, roughness: 0.9, metalness: 0.5})
    );
    sleeve.position.set(0, sleeveLength / 2 - SLEEVE_OFFSET, 0);
    limb.add(sleeve);
  }
  const upperArm = new THREE.Mesh(
    new THREE.BoxBufferGeometry(LIMB_WIDTH, limbLength, LIMB_WIDTH),
    new THREE.MeshStandardMaterial({color: skinColour, roughness: 0.9, metalness: 0.5})
  );
  upperArm.position.set(0, limbLength / 2, 0);
  limb.add(upperArm);
  const forearmGeo = new THREE.BoxBufferGeometry(LIMB_WIDTH, limbLength, LIMB_WIDTH);
  forearmGeo.applyMatrix(new THREE.Matrix4().makeTranslation(0, limbLength / 2, 0));
  const forearm = new THREE.Mesh(
    forearmGeo,
    new THREE.MeshStandardMaterial({color: skinColour, roughness: 0.9, metalness: 0.5})
  );
  forearm.position.set(0, limbLength - LIMB_WIDTH / 2, 0);
  limb.add(forearm);
  const obj = {
    limb,
    forearm,
    setPos(...args) {
      limb.position.set(...args);
      return obj;
    }
  };
  return obj;
}
function kneel(leg) {
  leg.limb.rotation.x = -Math.PI / 2 - 0.3;
  leg.forearm.rotation.x = Math.PI + 0.3;
}
function createPerson(skinColour, hairColour, hairHeight = 2.5, faceExpression = null, shirtColour = 0xeeeeee, shortsColour = 0x333333) {
  const person = new THREE.Group();
  const head = new THREE.Group();
  const face = new THREE.Mesh(
    new THREE.BoxBufferGeometry(2.5, 2.5, 2.5),
    new THREE.MeshStandardMaterial({color: skinColour, roughness: 0.9, metalness: 0.5})
  );
  head.add(face);
  const hair = new THREE.Mesh(
    new THREE.BoxBufferGeometry(2.7, hairHeight, 2.6),
    new THREE.MeshStandardMaterial({color: hairColour, roughness: 0.9, metalness: 0.5})
  );
  hair.position.set(0, 1.35 - hairHeight / 2, 0.1);
  head.add(hair);
  if (faceExpression) {
    const countenance = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2.5, 2.5),
      new THREE.MeshBasicMaterial({
        map: loadTexture(faceExpression),
        transparent: true
      })
    );
    countenance.position.set(0, 0, -1.26);
    countenance.rotation.y = Math.PI;
    head.add(countenance);
  }
  head.position.set(0, 11, 0);
  person.add(head);
  const body = new THREE.Mesh(
    new THREE.BoxBufferGeometry(3, 4, 1),
    new THREE.MeshStandardMaterial({color: shirtColour, roughness: 0.9, metalness: 0.5})
  );
  body.position.set(0, 8, 0);
  person.add(body);
  const limbs = [
    createLimb(2.5, skinColour, 1, shirtColour).setPos(-1.8, 9.8, 0), // left arm
    createLimb(2.5, skinColour, 1, shirtColour).setPos(1.8, 9.8, 0), // right arm
    createLimb(3, skinColour, 2, shortsColour).setPos(-1, 6, 0), // left leg
    createLimb(3, skinColour, 2, shortsColour).setPos(1, 6, 0) // right leg
  ];
  limbs.forEach(limb => {
    limb.limb.rotation.x = Math.PI;
    person.add(limb.limb);
  });
  return {person, limbs, head};
}

function easeOutSine(t) {
  return Math.sin(t * Math.PI / 2);
}
function randomSkin() {
  // http://johnthemathguy.blogspot.com/2013/08/what-color-is-human-skin.html
  const k = Math.random() * 6 - 3;
  return Math.floor(224.3 + 9.6 * k) * 0x10000
       + Math.floor(193.1 + 17.0 * k) * 0x100
       + Math.floor(177.6 + 21.0 * k);
}
function randomHair() {
  // technically skin colours, but dark brown enough
  const k = -Math.random() * 2 - 1.6768;
  return Math.floor(168.8 + 38.5 * k) * 0x10000
       + Math.floor(122.5 + 32.1 * k) * 0x100
       + Math.floor(96.7 + 26.3 * k);
}

function resetLimbRotations(student) {
  student.limbs[0].limb.rotation.set(0, 0, 0);
  student.limbs[0].forearm.rotation.set(0, 0, 0);
  student.limbs[1].limb.rotation.set(0, 0, 0);
  student.limbs[1].forearm.rotation.set(0, 0, 0);
}
function animateStrawBreath(student, timestamp) {
  if (student.mode !== 'expansion') {
    resetLimbRotations(student);
    student.limbs[0].forearm.rotation.z = 0.1;
    student.limbs[1].forearm.rotation.z = -0.1;
  }
  const stage = (timeStamp / 500 + student.offset) % 18;
  if (stage < 6) {
    student.limbs[0].limb.rotation.z = easeOutSine(stage / 6) * (Math.PI - 0.2) + 0.1;
    student.limbs[1].limb.rotation.z = -easeOutSine(stage / 6) * (Math.PI - 0.2) - 0.1;
  } else if (stage < 10) {
    student.limbs[0].limb.rotation.z = Math.PI - 0.1;
    student.limbs[1].limb.rotation.z = -Math.PI + 0.1;
  } else if (stage < 16) {
    student.limbs[0].limb.rotation.z = (1 - easeOutSine((stage - 10) / 6)) * (Math.PI - 0.2) + 0.1;
    student.limbs[1].limb.rotation.z = -(1 - easeOutSine((stage - 10) / 6)) * (Math.PI - 0.2) - 0.1;
  } else {
    student.limbs[0].limb.rotation.z = 0.1;
    student.limbs[1].limb.rotation.z = -0.1;
  }
}
function animateForcefulNose(student, timeStamp) {
  if (student.mode !== 'power') {
    resetLimbRotations(student);
    student.limbs[0].limb.rotation.z = 0.1;
    student.limbs[1].limb.rotation.z = -0.1;
  }
  const pos = Math.sin(timeStamp / 250 + student.offset);
  student.limbs[0].limb.rotation.x = pos * (Math.PI / 2 - 0.2) - (Math.PI / 2 - 0.2);
  student.limbs[0].forearm.rotation.x = -pos * (Math.PI / 2 - 0.2) + (Math.PI / 2 - 0.2);
  student.limbs[1].limb.rotation.x = pos * (Math.PI / 2 - 0.2) - (Math.PI / 2 - 0.2);
  student.limbs[1].forearm.rotation.x = -pos * (Math.PI / 2 - 0.2) + (Math.PI / 2 - 0.2);
}

function loadPeople(scene, onframe) {
  const instructor = createPerson(0x7B5542, 0x0f0705, 2.5, './textures/face-creepy.png');
  scene.add(instructor.person);
  instructor.person.rotation.y = Math.PI / 2;

  const lookLight = new THREE.SpotLight(0x990000, 0.5);
  lookLight.penumbra = 1;
  lookLight.position.set(0, 0, -1.25);
  instructor.head.add(lookLight);
  lookLight.target.position.set(0, -10, -10);
  instructor.head.add(lookLight.target);

  const sound = new THREE.PositionalAudio(listener);
  sound.setRefDistance(3); // TODO: change
  instructor.head.add(sound);

  onframe.push(timeStamp => {
    if (!instructor.moving) return;
    if (instructor.moving === 'watch') {
      const pos = ((timeStamp - instructor.walkOffsetTime) / 200 + 150) % 600;
      instructor.person.position.x = pos > 300 ? 450 - pos : pos - 150;
      instructor.person.rotation.y = pos > 300 ? Math.PI / 2 : -Math.PI / 2;
      instructor.limbs[2].limb.rotation.x = Math.PI + Math.sin(timeStamp / 200) * 0.3 + 0.1;
      instructor.limbs[2].forearm.rotation.x = -0.3 + Math.sin(timeStamp / 200 - 2.5) * 0.3;
      instructor.limbs[3].limb.rotation.x = Math.PI - Math.sin(timeStamp / 200) * 0.3 + 0.1;
      instructor.limbs[3].forearm.rotation.x = -0.3 - Math.sin(timeStamp / 200 - 2.5) * 0.3;
      instructor.head.rotation.y = Math.sin(timeStamp / 800) * Math.PI * 0.2 + Math.PI / 4 * (pos > 300 ? 1 : -1);
    } else {
      instructor.limbs[2].limb.rotation.x = Math.PI + Math.sin(timeStamp / 100) * 0.6 + 0.1;
      instructor.limbs[2].forearm.rotation.x = Math.sin(timeStamp / 100 - 2.1) * 0.6 - 0.6;
      instructor.limbs[3].limb.rotation.x = Math.PI - Math.sin(timeStamp / 100) * 0.6 + 0.1;
      instructor.limbs[3].forearm.rotation.x = -Math.sin(timeStamp / 100 - 2.1) * 0.6 - 0.6;
    }
  });

  const studentMap = {};
  const students = [];
  for (let x = -10; x <= 10; x++) {
    const stop = Math.random() < 0.5 ? 4 : 3;
    for (let z = x === 0 ? 1 : 0; z < stop; z++) {
      const student = createPerson(randomSkin(), randomHair(), Math.random() * 2 + 0.5, './textures/face-sleeping.png');
      student.person.position.set(
        x * (MAT_WIDTH + MAT_SPACING),
        -5,
        MAT_FIRST_ROW_Z + z * (MAT_LENGTH + MAT_SPACING) + (x % 2 === 0 ? STAGGER_DISTANCE : -STAGGER_DISTANCE)
      );
      kneel(student.limbs[2]);
      kneel(student.limbs[3]);
      scene.add(student.person);

      // forceful nose breath prep
      student.limbs[0].limb.rotation.z = 0.1;
      student.limbs[1].limb.rotation.z = -0.1;
      student.offset = Math.random() / 2;
      students.push(student);
      studentMap[`${x},${z}`] = true;
    }
  }

  // onframe.push(timeStamp => {
  //   if (!moving) animateForcefulNose(sittingPlayer, timeStamp);
  //   students.forEach(student => {
  //     animateForcefulNose(student, timeStamp);
  //   });
  // });

  return {studentMap, students, instructor, instructorVoice: sound};
}

function createPhone() {
  const phone = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxBufferGeometry(0.7, 0.1, 1.3),
    new THREE.MeshStandardMaterial({color: 0x343539, roughness: 0.9, metalness: 0.8})
  );
  phone.add(body);
  const screen = new THREE.Mesh(
    new THREE.BoxBufferGeometry(0.6, 0.01, 1.2),
    new THREE.MeshStandardMaterial({emissive: 0xffffff, roughness: 0.9, metalness: 0.8})
  );
  screen.position.y = 0.1;
  phone.add(screen);
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  const content = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(0.6, 1.2),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
    })
  );
  content.rotation.x = -Math.PI / 2;
  content.position.y = 0.11;
  phone.add(content);
  return {
    phone,
    canvas,
    content,
    update() {
      texture.needsUpdate = true;
    }
  };
}
function createPlayerSittingPerson() {
  const person = createPerson(randomSkin(), randomHair(), Math.random() * 2 + 0.5);
  kneel(person.limbs[2]);
  kneel(person.limbs[3]);
  person.person.remove(person.head);
  return person;
}
