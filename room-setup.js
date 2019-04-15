const textureLoader = new THREE.TextureLoader();

function createMat(x, z) {
  const mat = new THREE.Mesh(
    new THREE.BoxBufferGeometry(10, 0.4, 20),
    new THREE.MeshStandardMaterial({color: 0xbf4d4d, roughness: 0.9, metalness: 0.5})
  );
  mat.position.set(x, 0, z);
  return mat;
}

const LIMB_WIDTH = 0.5;
const SLEEVE_OFFSET = 0.1;
const SLEEVE_WIDTH = 0.7;
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
    const faceTexture = textureLoader.load(faceExpression);
    faceTexture.magFilter = THREE.NearestFilter;
    faceTexture.minFilter = THREE.NearestFilter;
    const countenance = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(2.5, 2.5),
      new THREE.MeshStandardMaterial({
        map: faceTexture,
        roughness: 0.9,
        metalness: 0.5,
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

function setupRoom(scene) {
  const onframe = [];

  const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({color: 0xF1C38E, roughness: 0.6, metalness: 0.2})
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  // const lampSphere = new THREE.Mesh(
  //   new THREE.SphereBufferGeometry(3),
  //   new THREE.MeshStandardMaterial({emissive: 0xffd6aa, roughness: 0.6, metalness: 0.2})
  // );
  // lampSphere.position.set(0, 10, -450);
  // scene.add(lampSphere);
  //
  // const lamp = new THREE.PointLight(0xffd6aa, 0.8);
  // lamp.position.set(0, 10, -450);
  // scene.add(lamp);

  const frontWall = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000, 200),
    new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.6, metalness: 0.4})
  );
  frontWall.position.set(0, 50, -500);
  scene.add(frontWall);

  for (let x = 0; x < 21; x++) {
    for (let z = 0; z < 6; z++) {
      scene.add(createMat((x - 10) * 15, -450 + z * 25));
    }
  }

  new THREE.ObjectLoader().load('./models/lamp.json', lampModel => {
    const lamp = lampModel.clone();
    lamp.position.set(50, 0, -480);
    scene.add(lamp);
    const lamp2 = lampModel.clone();
    lamp2.position.set(-80, 0, -480);
    scene.add(lamp2);
    console.log(lamp);
  });

  const {person, limbs} = createPerson(0xFFCFA6, 0x3C2017, 2.5, './textures/face-sleeping.png');
  person.position.set(100, 0, -475);
  scene.add(person);
  person.rotation.y = Math.PI / 2;
  onframe.push((elapsedTime, timeStamp) => {
    person.position.x -= elapsedTime / 200;
    limbs[2].limb.rotation.x = Math.PI + Math.sin(timeStamp / 200) * 0.3 + 0.1;
    limbs[2].forearm.rotation.x = -0.3 + Math.sin(timeStamp / 200 - 2.5) * 0.3;
    limbs[3].limb.rotation.x = Math.PI - Math.sin(timeStamp / 200) * 0.3 + 0.1;
    limbs[3].forearm.rotation.x = -0.3 - Math.sin(timeStamp / 200 - 2.5) * 0.3;
  });

  // is it:
  // up 2 3 4 5 6
  // hold 2 3 4
  // down 2 3 4 5 6
  // rest 2
  // ?
  const strawBreather = createPerson(0xFFCFA6, 0x3C2017, 2.5, './textures/face-sleeping.png');
  strawBreather.person.position.set(-30, -5, -450);
  scene.add(strawBreather.person);
  strawBreather.limbs[2].limb.rotation.x = -Math.PI / 2 - 0.3;
  strawBreather.limbs[3].limb.rotation.x = -Math.PI / 2 - 0.3;
  strawBreather.limbs[2].forearm.rotation.x = Math.PI + 0.3;
  strawBreather.limbs[3].forearm.rotation.x = Math.PI + 0.3;
  strawBreather.limbs[0].forearm.rotation.z = 0.1;
  strawBreather.limbs[1].forearm.rotation.z = -0.1;
  onframe.push((elapsedTime, timeStamp) => {
    const stage = timeStamp / 500 % 18;
    if (stage < 6) {
      strawBreather.limbs[0].limb.rotation.z = easeOutSine(stage / 6) * (Math.PI - 0.2) + 0.1;
      strawBreather.limbs[1].limb.rotation.z = -easeOutSine(stage / 6) * (Math.PI - 0.2) - 0.1;
    } else if (stage < 10) {
      strawBreather.limbs[0].limb.rotation.z = Math.PI - 0.1;
      strawBreather.limbs[1].limb.rotation.z = -Math.PI + 0.1;
    } else if (stage < 16) {
      strawBreather.limbs[0].limb.rotation.z = (1 - easeOutSine((stage - 10) / 6)) * (Math.PI - 0.2) + 0.1;
      strawBreather.limbs[1].limb.rotation.z = -(1 - easeOutSine((stage - 10) / 6)) * (Math.PI - 0.2) - 0.1;
    } else {
      strawBreather.limbs[0].limb.rotation.z = 0.1;
      strawBreather.limbs[1].limb.rotation.z = -0.1;
    }
  });

  const forcefulNose = createPerson(0xFFCFA6, 0x3C2017, 2.5, './textures/face-sleeping.png');
  forcefulNose.person.position.set(-15, -5, -450);
  scene.add(forcefulNose.person);
  forcefulNose.limbs[2].limb.rotation.x = -Math.PI / 2 - 0.3;
  forcefulNose.limbs[3].limb.rotation.x = -Math.PI / 2 - 0.3;
  forcefulNose.limbs[2].forearm.rotation.x = Math.PI + 0.3;
  forcefulNose.limbs[3].forearm.rotation.x = Math.PI + 0.3;
  forcefulNose.limbs[0].limb.rotation.z = 0.1;
  forcefulNose.limbs[1].limb.rotation.z = -0.1;
  onframe.push((elapsedTime, timeStamp) => {
    forcefulNose.limbs[0].limb.rotation.x = Math.sin(timeStamp / 250) * (Math.PI / 2 - 0.2) - (Math.PI / 2 - 0.2);
    forcefulNose.limbs[0].forearm.rotation.x = -Math.sin(timeStamp / 250) * (Math.PI / 2 - 0.2) + (Math.PI / 2 - 0.2);
    forcefulNose.limbs[1].limb.rotation.x = Math.sin(timeStamp / 250) * (Math.PI / 2 - 0.2) - (Math.PI / 2 - 0.2);
    forcefulNose.limbs[1].forearm.rotation.x = -Math.sin(timeStamp / 250) * (Math.PI / 2 - 0.2) + (Math.PI / 2 - 0.2);
  });

  return onframe;
}
