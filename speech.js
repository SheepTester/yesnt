const lines = { // [subtitles, pathToAudio]
  intro1: ['My plan to escape: While the instructor isn’t looking,', './sounds/intro1.mp3'],
  intro2: ['I sneak out my phone and decode the passcode on the secret Admin broadcast.', './sounds/intro2.mp3'],
  intro3: ['I then get up and try the code on all the doors until it works.', './sounds/intro3.mp3'],

  intro: ['Anyone remember the first one we do, the breathing?', './sounds/tts/Anyone-remember-the-first-one-we-do-the-breathing-.mp3'],
  introStraw: ['We’ll do the straw breath five times.', './sounds/tts/We-ll-do-the-straw-breath-five-times-.mp3'],
  introExpansion1: ['And then we’ll do the expansion breath.', './sounds/tts/And-then-we-ll-do-the-expansion-breath-.mp3'],
  introExpansion2: ['This one, using both of our arms.', './sounds/tts/This-one-using-both-of-our-arms-.mp3'],
  introExpansion3: ['So breathe in for six, hold for four, breathe out for six, and hold for two.', './sounds/tts/So-breathe-in-for-six-hold-for-four-breathe-out-for-six-and-hold-for-two-.mp3'],
  introExpansion4: ['We use victory breath for that.', './sounds/tts/We-use-victory-breath-for-that-.mp3'],
  introPower1: ['And then we’ll do the power breath.', './sounds/tts/And-then-we-ll-do-the-power-breath-.mp3'],
  introPower2: ['Three rounds of fifteen times each.', './sounds/tts/Three-rounds-of-fifteen-times-each-.mp3'],
  introOm: ['And then we say the OM sound three times', './sounds/tts/And-then-we-say-the-OM-sound-three-times.mp3'],
  introSohum1: ['And then I play the audio.', './sounds/tts/And-then-I-play-the-audio-.mp3'],
  introSohum2: ['The audio has two sounds: when you hear SO you inhale normally, when you hear HUM you exhale normally.', './sounds/tts/The-audio-has-two-sounds-when-you-hear-SO-you-inhale-normally-when-you-hear-HUM-you-exhale-normally-.mp3'],
  introSohum3: ['The whole breathing thing happens for just about ten to twelve minutes maximum,', './sounds/tts/The-whole-breathing-thing-happens-for-just-about-ten-to-twelve-minutes-maximum-.mp3'],
  introSohum4: ['and after that you get to lie down and rest for the rest of the period.', './sounds/tts/and-after-that-you-get-to-lie-down-and-rest-for-the-rest-of-the-period-.mp3'],
  introStagger: ['I invite you to stagger front and back so you can move your arms comfortably without hitting your neighbors.', './sounds/tts/I-invite-you-to-stagger-front-and-back-so-you-can-move-your-arms-comfortably-without-hitting-your-neighbors-.mp3'],
  introThreat1: ['And gentle reminder, you know if you are disruptive, if you are not participating,', './sounds/tts/And-gentle-reminder-you-know-if-you-are-disruptive-if-you-are-not-participating-.mp3'],
  introThreat2: ['then I will just ask your teacher to remove you.', './sounds/tts/then-I-will-just-ask-your-teacher-to-remove-you-.mp3'],

  eyesClosed: ['Alright, so eyes closed from this point on.', './sounds/tts/Alright-so-eyes-closed-from-this-point-on-.mp3'],
  straw1: ['Let’s start with five straw breaths,', './sounds/tts/Let-s-start-with-five-straw-breaths-.mp3'],
  straw2: ['Let’s do that four more times,', './sounds/tts/Let-s-do-that-four-more-times-.mp3'],
  straw: ['breathing in through the nose, out through the pretend straw in your mouth.', './sounds/tts/breathing-in-through-the-nose-out-through-the-pretend-straw-in-your-mouth-.mp3'],
  strawUseless: ['Keep your attention inward, don’t distract your mind.', './sounds/tts/Keep-your-attention-inward-don-t-distract-your-mind-.mp3'],
  straw3: ['Deep breath in, and exhale through the pretend straw.', './sounds/tts/Deep-breath-in-and-exhale-through-the-pretend-straw-.mp3'],
  straw4: ['One more time.', './sounds/tts/One-more-time-.mp3'],
  strawClosing: ['Center yourself, relax your shoulders, relax your neck.', './sounds/tts/Center-yourself-relax-your-shoulders-relax-your-neck-.mp3'],

  expansionOpening: ['Hands by your side for the expansion breath.', './sounds/tts/Hands-by-your-side-for-the-expansion-breath-.mp3'],
  normalBreath: ['Let’s take a normal breath in, and breathe out.', './sounds/tts/Let-s-take-a-normal-breath-in-and-breathe-out-.mp3'],
  expansionInstruct: ['Using victory breath from the back of the throat,', './sounds/tts/Using-victory-breath-from-the-back-of-the-throat-.mp3'],
  expansionArmsUp: ['breathe in, arms come up slowly, activate your vagus nerve,', './sounds/tts/breathe-in-arms-come-up-slowly-activate-your-vagus-nerve-.mp3'],
  expansionArmsDown: ['breathe out using victory, arms come down slowly', './sounds/tts/breathe-out-using-victory-arms-come-down-slowly.mp3'],
  breatheIn: ['breathe in,', './sounds/tts/breathe-in-comma.mp3'],
  breatheOut: ['breathe out,', './sounds/tts/breathe-out-.mp3'],
  holdBreath: ['hold your breath,', './sounds/tts/hold-your-breath-.mp3'],
  hold: ['hold,', './sounds/tts/hold-.mp3'],
  two: ['two,', './sounds/tts/two-.mp3'],
  three: ['three,', './sounds/tts/three-.mp3'],
  four: ['four,', './sounds/tts/four-.mp3'],
  five: ['five,', './sounds/tts/five-.mp3'],
  six: ['six,', './sounds/tts/six-.mp3'],
  relaxLong: ['Relax your hands on your lap, palms facing the ceiling.', './sounds/tts/Relax-your-hands-on-your-lap-palms-facing-the-ceiling-.mp3'],

  relaxShort: ['Relax your hands.', './sounds/tts/Relax-your-hands-.mp3'],
  powerKleenex1: ['Raise your hand if you need Kleenex® before we start power breath.', './sounds/tts/Raise-your-hand-if-you-need-Kleenex-before-we-start-power-breath-.mp3'],
  powerKleenex2: ['Second round, power breath, raise your hand if you need Kleenex®.', './sounds/tts/Second-round-power-breath-raise-your-hand-if-you-need-Kleenex-.mp3'],
  powerKleenex3: ['Raise your hand if you need Kleenex®.', './sounds/tts/Raise-your-hand-if-you-need-Kleenex-.mp3'],
  powerLastRound: ['Last round of power breath, hands in position.', './sounds/tts/Last-round-of-power-breath-hands-in-position-.mp3'],
  powerOpening: ['And loose fists by your shoulders, elbows by your body.', './sounds/tts/And-loose-fists-by-your-shoulders-elbows-by-your-body-.mp3'],
  powerStart: ['Take a normal breath in, and breathe out, and together:', './sounds/tts/Take-a-normal-breath-in-and-breathe-out-and-together-.mp3'],
  up: ['up,', './sounds/tts/up-.mp3'],
  down: ['down,', './sounds/tts/down-.mp3'],
  powerClosing: ['Let’s take a deep breath in, as we breathe out let’s relax our breath, relax our whole body.', './sounds/tts/Let-s-take-a-deep-breath-in-as-we-breathe-out-let-s-relax-our-breath-relax-our-whole-body-.mp3'],

  omOpening: ['Let’s take a deep breath in for the OM sound.', './sounds/tts/Let-s-take-a-deep-breath-in-for-the-om-sound-.mp3'],
  om: ['Ommm...', null],
  omBreathe: ['Breathe in.', './sounds/tts/breathe-in-.mp3'],

  stopRunning: ['Stop! Your vagus nerve is not fully activated!', './sounds/tts/Stop-Your-vagus-nerve-is-not-fully-activated-.mp3']
};

const usingTTS = window.speechSynthesis.onvoiceschanged !== undefined
  && params.get('use-tts') !== 'false' && options.audio >= 1;
const MS_PER_CHAR = params.get('fast-guess') ? 5 : 70; // guesstimate
const loadAudio = params.get('load-audio') !== 'false' && options.audio === 2;

let subtitles, ttsSpeak, ttsPromise;

if (usingTTS) {
  ttsPromise = new Promise(async res => {
    let voices = window.speechSynthesis.getVoices();
    if (!voices.length) {
      await new Promise(res => {
        window.speechSynthesis.addEventListener('voiceschanged', res, {once: true});
      });
      voices = window.speechSynthesis.getVoices();
    }
    const voice = voices.find(v => v.lang.includes('IN')) || voices[0];
    ttsSpeak = text => {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(text);
      speech.voice = voice;
      window.speechSynthesis.speak(speech);
      console.log(text);
      return speech;
    };
    res();
  });
}

function initSpeech() {
  subtitles = document.getElementById('subtitles');

  return Promise.all([
    userInteraction.then(() => listener.context.state === 'suspended' && listener.context.resume()),
    ...(loadAudio ? Object.values(lines).map(line => {
      if (!line[1]) return;
      return new Promise((res, rej) => {
        audioLoader.load(line[1], buffer => {
          line[1] = buffer;
          res();
        }, null, rej);
      });
    }) : []),
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
      if (line[1] && loadAudio) {
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
