const textureLoader = new THREE.TextureLoader();

const MAT_WIDTH = 10;
const MAT_LENGTH = 20;
const MAT_SPACING = 5;
function createMat(x, z) {
  const mat = new THREE.Mesh(
    new THREE.BoxBufferGeometry(MAT_WIDTH, 0.4, MAT_LENGTH),
    new THREE.MeshStandardMaterial({color: 0xbf4d4d, roughness: 0.9, metalness: 0.5})
  );
  mat.position.set(x, 0, z);
  return mat;
}

const mats = [];
function setupRoom(scene, onframe) {
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
      const mat = createMat((x - 10) * (MAT_WIDTH + MAT_SPACING), -450 + z * (MAT_LENGTH + MAT_SPACING));
      scene.add(mat);
      mats.push(mat);
    }
  }

  new THREE.ObjectLoader().load('./models/lamp.json', lampModel => {
    lampModel.scale.multiplyScalar(2);
    const lamp1 = lampModel.clone();
    const lampLight1 = lamp1.getObjectByName('lamp light');
    lamp1.position.set(50, 0, -480);
    scene.add(lamp1);
    const lamp2 = lampModel.clone();
    const lampLight2 = lamp2.getObjectByName('lamp light');
    lamp2.position.set(-80, 0, -480);
    scene.add(lamp2);
    const lamp3 = lampModel.clone();
    const lampLight3 = lamp3.getObjectByName('lamp light');
    lamp3.position.set(2, 0, -480);
    scene.add(lamp3);
    onframe.push(timeStamp => {
      lampLight1.intensity = Math.sin(timeStamp / 513 + 1) * 0.1 + 0.7;
      lampLight2.intensity = Math.sin(timeStamp / 445 + 2) * 0.1 + 0.7;
      lampLight3.intensity = Math.sin(timeStamp / 598 + 3) * 0.1 + 0.7;
    });
  });

  const sound = new THREE.PositionalAudio(listener);
  new THREE.AudioLoader().load('sounds/sohum.mp3', buffer => {
    sound.setBuffer(buffer);
  	sound.setRefDistance(5);
  	if (!params.get('shut-up')) userInteraction.then(() => sound.play());
  });
  new THREE.ObjectLoader().load('./models/cassette-player.json', cassettePlayer => {
    cassettePlayer.position.set(5, 0, -495);
    cassettePlayer.scale.multiplyScalar(3);
    scene.add(cassettePlayer);
    cassettePlayer.add(sound);
  });
}
