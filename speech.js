const lines = {
  line0: ['Do you recall how to play? Shift to get up, WASD to move.', null],
  line1: ['Alright, so eyes closed from this point on.', null],
  line2: ["Let's start with five straw breaths, breathing in through the nose.", null]
};

let subtitles;

function initSpeech() {
  subtitles = document.getElementById('subtitles');

  const loader = new THREE.AudioLoader(manager);
  return Promise.all(Object.values(lines).map(line => {
    if (!line[1]) return;
    return new Promise((res, rej) => {
      loader.load(line[1], buffer => {
        line[1] = buffer;
        res();
      }, null, rej);
    });
  }));
}

function speaking(instructorVoice) {
  let onend = null;
  instructorVoice.onEnded(() => {
    if (onEnd) onEnd();
  });
  return (lineID, length = null) => new Promise((res, rej) => {
    const line = lines[lineID];
    if (!line) return rej("Line doesn't exist.");
    if (line[1]) {
      instructorVoice.setBuffer(line[1]);
      instructorVoice.play();
      if (!length) onEnd = res;
    } else {
      if (!length) length = line[0].length * 100; // guesstimate
    }
    subtitles.textContent = line[0];
    if (length) {
      setTimeout(res, length);
    }
  }).then(() => {
    subtitles.textContent = '';
    onEnd = null;
  });
}
