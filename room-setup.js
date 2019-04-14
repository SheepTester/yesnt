function setupRoom(scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000, 1000),
    new THREE.MeshPhysicalMaterial({color: 0xF1C38E, roughness: 0.6, metalness: 0.2})
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const lampSphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(3),
    new THREE.MeshPhysicalMaterial({emissive: 0xffd6aa, roughness: 0.6, metalness: 0.2})
  );
  lampSphere.position.set(0, 10, -450);
  scene.add(lampSphere);

  const lamp = new THREE.PointLight(0xffd6aa, 0.5);
  lamp.position.set(0, 10, -450);
  scene.add(lamp);

  const frontWall = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000, 200),
    new THREE.MeshPhysicalMaterial({color: 0xffffff, roughness: 0.6, metalness: 0.4})
  );
  frontWall.position.set(0, 50, -500);
  scene.add(frontWall);
}
