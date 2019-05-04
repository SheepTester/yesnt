const MAT_WIDTH = 10;
const MAT_LENGTH = 20;
const MAT_SPACING = 5;
const MAT_FIRST_ROW_Z = -450;
const MAT_COLOURS = [0xc98838, 0xbf4d4d, 0xbf4d4d, 0xbf4d4d, 0xbb6a78, 0x473068, 0x373e6f];
function createMat(x, z) {
  const mat = new THREE.Mesh(
    new THREE.BoxBufferGeometry(MAT_WIDTH, 0.4, MAT_LENGTH),
    gameMaterial(MAT_COLOURS[Math.floor(Math.random() * MAT_COLOURS.length)], 0, 0.9, 0.5)
  );
  mat.position.set(x, 0, z);
  return mat;
}

function createExitSign(url) {
  const sign = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxBufferGeometry(8.5, 4.5, 1),
    gameMaterial(0xcccccc, 0, 0.1, 0.1)
  );
  sign.add(base);
  const text = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(8, 4),
    new THREE.MeshBasicMaterial({
      map: loadTexture(url || './textures/exit.png'),
      transparent: true
    })
  );
  text.position.z = 0.55;
  sign.add(text);
  return sign;
}

function createDoor() {
  const door = new THREE.Group();
  const panel = new THREE.Mesh(
    new THREE.BoxBufferGeometry(14, 24, 1),
    gameMaterial(0x807c79, 0, 0.3, 0.9)
  );
  panel.position.set(7, 12, 0);
  door.add(panel);
  const bar = new THREE.Mesh(
    new THREE.BoxBufferGeometry(12, 1, 2),
    gameMaterial(0xc5c1bf, 0, 0.3, 0.9)
  );
  bar.position.set(7, 12, 0);
  door.add(bar);
  return door;
}
function createDoubleDoors(exitSignURL) {
  const door = new THREE.Group();
  door.isDoors = true;
  const exitSign = createExitSign(exitSignURL);
  exitSign.position.y = 30;
  door.add(exitSign);
  const leftDoor = createDoor();
  leftDoor.position.x = -14;
  door.add(leftDoor);
  const rightDoor = createDoor();
  rightDoor.rotation.y = Math.PI;
  rightDoor.position.x = 14;
  door.add(rightDoor);
  return door;
}

let wallMaterial;

const mats = [];
function setupRoom(scene, onframe, collisions) {
  wallMaterial = gameMaterial(0xffffff, 0, 0.9, 0.1);

  const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000, 1000),
    gameMaterial(0xF1C38E, 0, 0.6, 0.2)
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  let darkPhongFloor;
  if (usingLambert) {
    // separate floor so the red light shows
    darkPhongFloor = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(100, 100),
      new THREE.MeshPhongMaterial({color: 0xF1C38E, shininess: 50})
    );
    darkPhongFloor.rotation.x = -Math.PI / 2;
  }

  const frontWall = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000, 200),
    wallMaterial
  );
  frontWall.position.set(0, 100, -500);
  scene.add(frontWall);

  let dark = false;
  const {darkRoom, doors} = createDarkRoom();
  const lightRoom = createLightRoom();
  scene.add(lightRoom);

  for (let x = -10; x <= 10; x++) {
    for (let z = 0; z < 6; z++) {
      const mat = createMat(x * (MAT_WIDTH + MAT_SPACING), MAT_FIRST_ROW_Z + z * (MAT_LENGTH + MAT_SPACING));
      scene.add(mat);
      mats.push(mat);
    }
  }

  const CANDLE_RADIUS = 0.1 + PLAYER_THICKNESS;
  objectLoader.load('./models/candle.json', model => {
    model.scale.multiplyScalar(0.5);
    const lights = [[-15, -490], [-20, -490], [-25, -490]].map(([x, z]) => {
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
  objectLoader.load('./models/better-lamp.json', lamp => {
    const [x, z] = [15, -490];
    lamp.position.set(x, 0, z);
    collisions.push([x - LAMP_RADIUS, x + LAMP_RADIUS, z - LAMP_RADIUS, z + LAMP_RADIUS]);
    scene.add(lamp);
  });

  const sound = new THREE.PositionalAudio(listener);
  audioLoader.load('sounds/sohum.mp3', buffer => {
    sound.setBuffer(buffer);
  	sound.setRefDistance(5);
  });
  objectLoader.load('./models/cassette-player.json', cassettePlayer => {
    cassettePlayer.position.set(5, 0, -495);
    cassettePlayer.scale.multiplyScalar(3);
    scene.add(cassettePlayer);
    cassettePlayer.add(sound);
    collisions.push([5 - 4.5 - PLAYER_THICKNESS, 5 + 4.5 + PLAYER_THICKNESS, -495 - 1.5 - PLAYER_THICKNESS, -495 + 1.5 + PLAYER_THICKNESS]);
  });

  return {
    swap() {
      scene.remove(dark ? darkRoom : lightRoom);
      if (darkPhongFloor) scene.remove(dark ? darkPhongFloor : floor);
      dark = !dark;
      scene.add(dark ? darkRoom : lightRoom);
      if (darkPhongFloor) scene.add(dark ? darkPhongFloor : floor);
    },
    isDark() {
      return dark;
    },
    darkPhongFloor,
    doors,
    cassette: sound
  };
}

const DARK_DOOR_TUNNEL_PADDING = 30;
const DARK_DOOR_TUNNEL_WIDTH = 100;
const DARK_TUNNEL_LENGTH = 500;

function createDarkRoom() {
  const doorList = [];

  const DARK_WALLS_HEIGHT = 200;
  const darkRoom = new THREE.Group();

  const backWall = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000, 200),
    wallMaterial
  );
  backWall.rotation.y = Math.PI;
  backWall.position.set(0, 100, 500);
  darkRoom.add(backWall);

  const leftWall = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000, DARK_WALLS_HEIGHT),
    wallMaterial
  );
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-500, DARK_WALLS_HEIGHT / 2, 0);
  darkRoom.add(leftWall);

  const DOOR_TUNNEL_HEIGHT = 60;
  const DOOR_TUNNEL_PADDING = DARK_DOOR_TUNNEL_PADDING;
  const DOOR_TUNNEL_WIDTH = DARK_DOOR_TUNNEL_WIDTH;

  const rightWall = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000, DARK_WALLS_HEIGHT - DOOR_TUNNEL_HEIGHT),
    wallMaterial
  );
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(500, DOOR_TUNNEL_HEIGHT / 2 + DARK_WALLS_HEIGHT / 2, 0);
  darkRoom.add(rightWall);

  const rightWallLeftPanel = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(DOOR_TUNNEL_PADDING, DOOR_TUNNEL_HEIGHT),
    wallMaterial
  );
  rightWallLeftPanel.rotation.y = -Math.PI / 2;
  rightWallLeftPanel.position.set(500, DOOR_TUNNEL_HEIGHT / 2, -500 + DOOR_TUNNEL_PADDING / 2);
  darkRoom.add(rightWallLeftPanel);

  const rightWallMidPanel = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1000 - (DOOR_TUNNEL_PADDING + DOOR_TUNNEL_WIDTH) * 2, DOOR_TUNNEL_HEIGHT),
    wallMaterial
  );
  rightWallMidPanel.rotation.y = -Math.PI / 2;
  rightWallMidPanel.position.set(500, DOOR_TUNNEL_HEIGHT / 2, 0);
  darkRoom.add(rightWallMidPanel);

  const rightWallRightPanel = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(DOOR_TUNNEL_PADDING, DOOR_TUNNEL_HEIGHT),
    wallMaterial
  );
  rightWallRightPanel.rotation.y = -Math.PI / 2;
  rightWallRightPanel.position.set(500, DOOR_TUNNEL_HEIGHT / 2, 500 - DOOR_TUNNEL_PADDING / 2);
  darkRoom.add(rightWallRightPanel);

  const tunnelMaterial = gameMaterial(0x6C3011, 0, 0.9, 0.1);
  const TUNNEL_LENGTH = DARK_TUNNEL_LENGTH;
  [
    -500 + DOOR_TUNNEL_PADDING + DOOR_TUNNEL_WIDTH / 2,
    500 - DOOR_TUNNEL_PADDING - DOOR_TUNNEL_WIDTH / 2
  ].forEach(z => {
    const leftWall = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(TUNNEL_LENGTH, DOOR_TUNNEL_HEIGHT),
      tunnelMaterial
    );
    leftWall.position.set(500 + TUNNEL_LENGTH / 2, DOOR_TUNNEL_HEIGHT / 2, z - DOOR_TUNNEL_WIDTH / 2);
    darkRoom.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(TUNNEL_LENGTH, DOOR_TUNNEL_HEIGHT),
      tunnelMaterial
    );
    rightWall.rotation.y = Math.PI;
    rightWall.position.set(500 + TUNNEL_LENGTH / 2, DOOR_TUNNEL_HEIGHT / 2, z + DOOR_TUNNEL_WIDTH / 2);
    darkRoom.add(rightWall);

    const roof = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(TUNNEL_LENGTH, DOOR_TUNNEL_WIDTH),
      wallMaterial
    );
    roof.rotation.x = Math.PI / 2;
    roof.position.set(500 + TUNNEL_LENGTH / 2, DOOR_TUNNEL_HEIGHT, z);
    darkRoom.add(roof);

    if (!usingLambert) {
      const floor = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(TUNNEL_LENGTH, DOOR_TUNNEL_WIDTH),
        gameMaterial(0x717276, 0, 0.9, 0.1)
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(500 + TUNNEL_LENGTH / 2, 0, z);
      darkRoom.add(floor);
    }

    const backWall = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(DOOR_TUNNEL_WIDTH, DOOR_TUNNEL_HEIGHT),
      tunnelMaterial
    );
    backWall.rotation.y = -Math.PI / 2;
    backWall.position.set(500 + TUNNEL_LENGTH, DOOR_TUNNEL_HEIGHT / 2, z);
    darkRoom.add(backWall);

    const exitSign = createExitSign();
    exitSign.rotation.y = -Math.PI / 2;
    exitSign.position.set(500 - 0.1, DOOR_TUNNEL_HEIGHT + 5, z);
    darkRoom.add(exitSign);

    const doors = createDoubleDoors();
    doors.rotation.y = -Math.PI / 2;
    doors.position.set(500 + TUNNEL_LENGTH, 0, z);
    darkRoom.add(doors);
    doorList.push(doors);
  });

  [
    -280,
    -250,
    250,
    280
  ].forEach((z, i) => {
    const doors = createDoubleDoors(i === 0 && './textures/exit-green.png');
    doors.rotation.y = Math.PI / 2;
    doors.position.set(-500, 0, z);
    darkRoom.add(doors);
    doorList.push(doors);
  });

  return {darkRoom, doors: doorList};
}

function createLightRoom() {
  const LIGHT_ROOM_HEIGHT = 100;
  const ROOM_LENGTH = 600;
  const ROOM_WIDTH = 700;
  const SLANT_HEIGHT = 20;
  const ROOF_ANGLE = Math.atan(SLANT_HEIGHT / (ROOM_LENGTH / 2));
  const ROOF_LENGTH = Math.hypot(SLANT_HEIGHT, ROOM_LENGTH / 2);
  const lightRoom = new THREE.Group();

  const roofFront = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(ROOM_WIDTH, ROOF_LENGTH),
    wallMaterial
  );
  roofFront.rotation.x = Math.PI / 2 - ROOF_ANGLE;
  roofFront.position.set(0, LIGHT_ROOM_HEIGHT + SLANT_HEIGHT / 2, -500 + ROOM_LENGTH / 4);
  lightRoom.add(roofFront);

  const roofBack = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(ROOM_WIDTH, ROOF_LENGTH),
    wallMaterial
  );
  roofBack.rotation.x = Math.PI / 2 + ROOF_ANGLE;
  roofBack.position.set(0, LIGHT_ROOM_HEIGHT + SLANT_HEIGHT / 2, -500 + ROOM_LENGTH * 3 / 4);
  lightRoom.add(roofBack);

  const backWall = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(ROOM_WIDTH, LIGHT_ROOM_HEIGHT),
    wallMaterial
  );
  backWall.rotation.y = Math.PI;
  backWall.position.set(0, LIGHT_ROOM_HEIGHT / 2, -500 + ROOM_LENGTH);
  lightRoom.add(backWall);

  const leftWall = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(ROOM_LENGTH, LIGHT_ROOM_HEIGHT + SLANT_HEIGHT),
    wallMaterial
  );
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-ROOM_WIDTH / 2, (LIGHT_ROOM_HEIGHT + SLANT_HEIGHT) / 2, -500 + ROOM_LENGTH / 2);
  lightRoom.add(leftWall);

  const DOOR_TUNNEL_HEIGHT = 50;
  const DOOR_TUNNEL_PADDING = 30;
  const DOOR_TUNNEL_WIDTH = 80;

  const rightWall = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(ROOM_LENGTH, LIGHT_ROOM_HEIGHT + SLANT_HEIGHT - DOOR_TUNNEL_HEIGHT),
    wallMaterial
  );
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(ROOM_WIDTH / 2, (LIGHT_ROOM_HEIGHT + SLANT_HEIGHT + DOOR_TUNNEL_HEIGHT) / 2, -500 + ROOM_LENGTH / 2);
  lightRoom.add(rightWall);

  const rightWallLeftPanel = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(DOOR_TUNNEL_PADDING, DOOR_TUNNEL_HEIGHT),
    wallMaterial
  );
  rightWallLeftPanel.rotation.y = -Math.PI / 2;
  rightWallLeftPanel.position.set(ROOM_WIDTH / 2, DOOR_TUNNEL_HEIGHT / 2, -500 + DOOR_TUNNEL_PADDING / 2);
  lightRoom.add(rightWallLeftPanel);

  const rightWallMidPanel = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(ROOM_LENGTH - (DOOR_TUNNEL_PADDING + DOOR_TUNNEL_WIDTH) * 2, DOOR_TUNNEL_HEIGHT),
    wallMaterial
  );
  rightWallMidPanel.rotation.y = -Math.PI / 2;
  rightWallMidPanel.position.set(ROOM_WIDTH / 2, DOOR_TUNNEL_HEIGHT / 2, -500 + ROOM_LENGTH / 2);
  lightRoom.add(rightWallMidPanel);

  const rightWallRightPanel = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(DOOR_TUNNEL_PADDING, DOOR_TUNNEL_HEIGHT),
    wallMaterial
  );
  rightWallRightPanel.rotation.y = -Math.PI / 2;
  rightWallRightPanel.position.set(ROOM_WIDTH / 2, DOOR_TUNNEL_HEIGHT / 2, -500 + ROOM_LENGTH - DOOR_TUNNEL_PADDING / 2);
  lightRoom.add(rightWallRightPanel);

  const tunnelMaterial = wallMaterial.clone();
  tunnelMaterial.emissive.set(0x222222);
  const TUNNEL_LENGTH = 150;
  [
    -500 + DOOR_TUNNEL_PADDING + DOOR_TUNNEL_WIDTH / 2,
    -500 + ROOM_LENGTH - DOOR_TUNNEL_PADDING - DOOR_TUNNEL_WIDTH / 2
  ].forEach(z => {
    const leftWall = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(TUNNEL_LENGTH, DOOR_TUNNEL_HEIGHT),
      tunnelMaterial
    );
    leftWall.position.set(ROOM_WIDTH / 2 + TUNNEL_LENGTH / 2, DOOR_TUNNEL_HEIGHT / 2, z - DOOR_TUNNEL_WIDTH / 2);
    lightRoom.add(leftWall);

    const rightWall = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(TUNNEL_LENGTH, DOOR_TUNNEL_HEIGHT),
      tunnelMaterial
    );
    rightWall.rotation.y = Math.PI;
    rightWall.position.set(ROOM_WIDTH / 2 + TUNNEL_LENGTH / 2, DOOR_TUNNEL_HEIGHT / 2, z + DOOR_TUNNEL_WIDTH / 2);
    lightRoom.add(rightWall);

    const roof = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(TUNNEL_LENGTH, DOOR_TUNNEL_WIDTH),
      tunnelMaterial
    );
    roof.rotation.x = Math.PI / 2;
    roof.position.set(ROOM_WIDTH / 2 + TUNNEL_LENGTH / 2, DOOR_TUNNEL_HEIGHT, z);
    lightRoom.add(roof);

    const backWall = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(DOOR_TUNNEL_WIDTH, DOOR_TUNNEL_HEIGHT),
      tunnelMaterial
    );
    backWall.rotation.y = -Math.PI / 2;
    backWall.position.set(ROOM_WIDTH / 2 + TUNNEL_LENGTH, DOOR_TUNNEL_HEIGHT / 2, z);
    lightRoom.add(backWall);

    const exitSign = createExitSign();
    exitSign.rotation.y = -Math.PI / 2;
    exitSign.position.set(ROOM_WIDTH / 2 - 0.1, DOOR_TUNNEL_HEIGHT + 5, z);
    lightRoom.add(exitSign);

    const doors = createDoubleDoors();
    doors.rotation.y = -Math.PI / 2;
    doors.position.set(ROOM_WIDTH / 2 + TUNNEL_LENGTH, 0, z);
    lightRoom.add(doors);
  });

  objectLoader.load('./models/gym-light-on.json', model => {
    model.scale.multiplyScalar(3);
    for (let x = -300; x <= 300; x += 100) {
      for (let z = 50; z <= 250; z += 100) {
        const light = model.clone();
        light.position.set(x, LIGHT_ROOM_HEIGHT + SLANT_HEIGHT * (1 - z / (ROOM_LENGTH / 2)), -500 + ROOM_LENGTH / 2 + z);
        lightRoom.add(light);
      }
    }
  });

  objectLoader.load('./models/gym-light-off.json', model => {
    model.scale.multiplyScalar(3);
    for (let x = -300; x <= 300; x += 100) {
      for (let z = 50; z <= 250; z += 100) {
        const light = model.clone();
        light.position.set(x, LIGHT_ROOM_HEIGHT + SLANT_HEIGHT * (1 - z / (ROOM_LENGTH / 2)), -500 + ROOM_LENGTH / 2 - z);
        lightRoom.add(light);
      }
    }
  });

  [
    -130,
    -100,
    100,
    130
  ].forEach((z, i) => {
    const doors = createDoubleDoors(i === 0 && './textures/exit-green.png');
    doors.rotation.y = Math.PI / 2;
    doors.position.set(-ROOM_WIDTH / 2, 0, -500 + ROOM_LENGTH / 2 + z);
    lightRoom.add(doors);
  });

  return lightRoom;
}
