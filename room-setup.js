function createMat(x, z) {
  const mat = new THREE.Mesh(
    new THREE.BoxBufferGeometry(10, 0.4, 20),
    new THREE.MeshStandardMaterial({color: 0xbf4d4d, roughness: 0.9, metalness: 0.5})
  );
  mat.position.set(x, 0, z);
  return mat;
}

function setupRoom(scene) {
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
  });
}
