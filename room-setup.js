const MAT_WIDTH = 10;
const MAT_LENGTH = 20;
const MAT_SPACING = 5;
const MAT_FIRST_ROW_Z = -450;
function createMat(x, z) {
  const mat = new THREE.Mesh(
    new THREE.BoxBufferGeometry(MAT_WIDTH, 0.4, MAT_LENGTH),
    new THREE.MeshStandardMaterial({color: 0xbf4d4d, roughness: 0.9, metalness: 0.5})
  );
  mat.position.set(x, 0, z);
  return mat;
}

const mats = [];
function setupRoom(scene, onframe,collisions) {
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
    new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.6, metalness: 0.1})
  );
  frontWall.position.set(0, 50, -500);
  scene.add(frontWall);

  for (let x = -10; x <= 10; x++) {
    for (let z = 0; z < 6; z++) {
      const mat = createMat(x * (MAT_WIDTH + MAT_SPACING), MAT_FIRST_ROW_Z + z * (MAT_LENGTH + MAT_SPACING));
      scene.add(mat);
      mats.push(mat);
    }
  }

  const CANDLE_RADIUS = 0.1 + PLAYER_THICKNESS;
  new THREE.ObjectLoader(manager).load('./models/candle.json', model => {
    model.scale.multiplyScalar(0.5);
    const lights = [[-15, -480], [-20, -480], [-25, -480]].map(([x, z]) => {
      const candle = model.clone();
      const light = candle.getObjectByName('flame');
      candle.position.set(x, 0, z);
      collisions.push([x - CANDLE_RADIUS, x + CANDLE_RADIUS, z - CANDLE_RADIUS, z + CANDLE_RADIUS]);
      scene.add(candle);
      return light;
    });
    onframe.push(timeStamp => {
      lights[0].intensity = Math.sin(timeStamp / 243 + 1) * 0.01 + 0.1;
      lights[1].intensity = Math.sin(timeStamp / 305 + 2) * 0.01 + 0.1;
      lights[2].intensity = Math.sin(timeStamp / 288 + 3) * 0.01 + 0.1;
    });
  });

  const LAMP_RADIUS = 1.5 + PLAYER_THICKNESS;
  new THREE.ObjectLoader(manager).load('./models/better-lamp.json', lamp => {
    const [x, z] = [15, -480];
    lamp.position.set(x, 0, z);
    collisions.push([x - LAMP_RADIUS, x + LAMP_RADIUS, z - LAMP_RADIUS, z + LAMP_RADIUS]);
    scene.add(lamp);
  });

  const sound = new THREE.PositionalAudio(listener);
  new THREE.AudioLoader(manager).load('sounds/sohum.mp3', buffer => {
    sound.setBuffer(buffer);
  	sound.setRefDistance(5);
  	if (!params.get('shut-up')) userInteraction.then(() => sound.play());
  });
  new THREE.ObjectLoader(manager).load('./models/cassette-player.json', cassettePlayer => {
    cassettePlayer.position.set(5, 0, -495);
    cassettePlayer.scale.multiplyScalar(3);
    scene.add(cassettePlayer);
    cassettePlayer.add(sound);
    collisions.push([5 - 4.5 - PLAYER_THICKNESS, 5 + 4.5 + PLAYER_THICKNESS, -495 - 1.5 - PLAYER_THICKNESS, -495 + 1.5 + PLAYER_THICKNESS]);
  });
}
