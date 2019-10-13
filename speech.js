const lines = { // [subtitles, pathToAudio]
  intro1: ['My plan to escape: While the instructor isn’t looking,', './sounds/intro1.mp3'],
  intro2: ['I sneak out my phone and decode the passcode on the secret Admin broadcast.', './sounds/intro2.mp3'],
  intro3: ['I then get up and try the code on all the doors until it works.', './sounds/intro3.mp3'],

  intro: ['Anyone remember the first one we do, the breathing?', null],
  introStraw: ['We’ll do the straw breath five times.', null],
  introExpansion1: ['And then we’ll do the expansion breath.', null],
  introExpansion2: ['This one, using both of our arms.', null],
  introExpansion3: ['So breathe in for six, hold for four, breathe out for six, and hold for two.', null],
  introExpansion4: ['We use victory breath for that.', null],
  introPower1: ['And then we’ll do the power breath.', null],
  introPower2: ['Three rounds of fifteen times each.', null],
  introOm: ['And then we say the OM sound three times', null],
  introSohum1: ['And then I play the audio.', null],
  introSohum2: ['The audio has two sounds: when you hear SO you inhale normally, when you hear HUM you exhale normally.', null],
  introSohum3: ['The whole breathing thing happens for just about ten to twelve minutes maximum,', null],
  introSohum4: ['and after that you get to lie down and rest for the rest of the period.', null],
  introStagger: ['I invite you to stagger front and back so you can move your arms comfortably without hitting your neighbors.', null],
  introThreat1: ['And gentle reminder, you know if you are disruptive, if you are not participating,', null],
  introThreat2: ['then I will just ask your teacher to remove you.', null],

  eyesClosed: ['Alright, so eyes closed from this point on.', null],
  straw1: ['Let’s start with five straw breaths,', null],
  straw2: ['Let’s do that four more times,', null],
  straw: ['breathing in through the nose, out through the pretend straw in your mouth.', null],
  strawUseless: ['Keep your attention inward, don’t distract your mind.', null],
  straw3: ['Deep breath in, and exhale through the pretend straw.', null],
  straw4: ['One more time.', null],
  strawClosing: ['Center yourself, relax your shoulders, relax your neck.', null],

  expansionOpening: ['Hands by your side for the expansion breath.', null],
  normalBreath: ['Let’s take a normal breath in, and breathe out.', null],
  expansionInstruct: ['Using victory breath from the back of the throat,', null],
  expansionArmsUp: ['breathe in, arms come up slowly, activate your vagus nerve,', null],
  expansionArmsDown: ['breathe out using victory, arms come down slowly', null],
  breatheIn: ['breathe in,', null],
  breatheOut: ['breathe out,', null],
  holdBreath: ['hold your breath,', null],
  hold: ['hold,', null],
  two: ['two,', null],
  three: ['three,', null],
  four: ['four,', null],
  five: ['five,', null],
  six: ['six,', null],
  relaxLong: ['Relax your hands on your lap, palms facing the ceiling.', null],

  relaxShort: ['Relax your hands.', null],
  powerKleenex1: ['Raise your hand if you need Kleenex® before we start power breath.', null],
  powerKleenex2: ['Second round, power breath, raise your hand if you need Kleenex®.', null],
  powerKleenex3: ['Raise your hand if you need Kleenex®.', null],
  powerLastRound: ['Last round of power breath, hands in position.', null],
  powerOpening: ['And loose fists by your shoulders, elbows by your body.', null],
  powerStart: ['Take a normal breath in, and breathe out, and together:', null],
  up: ['up,', null],
  down: ['down,', null],
  powerClosing: ['Let’s take a deep breath in, as we breathe out let’s relax our breath, relax our whole body.', null],

  omOpening: ['Let’s take a deep breath in for the OM sound.', null],
  om: ['Ommm...', null],
  omBreathe: ['Breathe in.', null],

  stopRunning: ['Stop! Your vagus nerve is not fully activated!', null]
};

const usingTTS = params.get('use-tts') !== 'false';
const MS_PER_CHAR = params.get('fast-guess') ? 5 : 100; // guesstimate

let subtitles, ttsSpeak, ttsPromise;

if (usingTTS) {
  ttsPromise = new Promise(res => {
    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.includes('IN')) || voices[0];
      ttsSpeak = text => {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(text);
        speech.voice = voice;
        window.speechSynthesis.speak(speech);
        console.log(text);
        return speech;
      };
      window.speechSynthesis.onvoiceschanged = null;
      res();
    };
  });
}

function initSpeech() {
  subtitles = document.getElementById('subtitles');

  return Promise.all([
    userInteraction.then(() => listener.context.state === 'suspended' && listener.context.resume()),
    ...Object.values(lines).map(line => {
      if (!line[1]) return;
      return new Promise((res, rej) => {
        audioLoader.load(line[1], buffer => {
          line[1] = buffer;
          res();
        }, null, rej);
      });
    }),
    usingTTS && ttsPromise
  ]);
}

function speaking(instructorVoice) {
  let onEnd = null, cancelEarly = null;
  instructorVoice.onEnded = function() {
    if (onEnd) onEnd();
    this.isPlaying = false;
  };
  return {
    speak: (lineID, length = null) => new Promise((res, rej) => {
      const line = lines[lineID];
      if (!line) return rej("Line doesn't exist.");
      if (line[1]) {
        instructorVoice.setBuffer(line[1]);
        instructorVoice.play();
        if (!length) onEnd = () => res();
        cancelEarly = () => instructorVoice.stop();
      } else if (usingTTS) {
        const speech = ttsSpeak(line[0]);
        if (!length) speech.onend = () => res();
        cancelEarly = () => window.speechSynthesis.cancel();
      } else {
        if (!length) length = line[0].length * MS_PER_CHAR;
      }
      subtitles.textContent = line[0];
      const tempFn = cancelEarly;
      if (length) {
        const id = setTimeout(() => res(), length);
        cancelEarly = () => {
          if (tempFn) tempFn();
          clearTimeout(id);
          res(true);
        };
      } else {
        cancelEarly = () => {
          if (tempFn) tempFn();
          res(true);
        };
      }
    }).then(wasInterrupted => {
      subtitles.textContent = '';
      onEnd = null;
      cancelEarly = null;
      return !wasInterrupted;
    }),
    interrupt: () => {
      if (cancelEarly) cancelEarly();
    }
  };
}
