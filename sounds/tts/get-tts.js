// node sounds/tts/get-tts.js

const querystring = require('querystring');
const path = require('path');
const {text, fetch, download} = require('./download');

const lines = ["Anyone remember the first one we do, the breathing?","We’ll do the straw breath five times.","And then we’ll do the expansion breath.","This one, using both of our arms.","So breathe in for six, hold for four, breathe out for six, and hold for two.","We use victory breath for that.","And then we’ll do the power breath.","Three rounds of fifteen times each.","And then we say the OM sound three times","And then I play the audio.","The audio has two sounds: when you hear SO you inhale normally, when you hear HUM you exhale normally.","The whole breathing thing happens for just about ten to twelve minutes maximum,","and after that you get to lie down and rest for the rest of the period.","I invite you to stagger front and back so you can move your arms comfortably without hitting your neighbors.","And gentle reminder, you know if you are disruptive, if you are not participating,","then I will just ask your teacher to remove you."];

(async () => {
  for (const line of lines) {
    const fileName = line.replace(/\W+/g, '-');
    console.log(line + '\t' + fileName);
    try {
      const postData = querystring.stringify({
        msg: line,
        lang: 'Raveena',
        source: 'ttsmp3'
      });
      const {URL: url} = JSON.parse(await fetch({
        hostname: 'ttsmp3.com',
        path: '/makemp3.php',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, req => {
        req.write(postData);
      }).then(r => text(r)));
      await download(url, path.resolve(__dirname, `./${fileName}.mp3`));
    } catch (err) {
      console.error('Big problem!');
      console.error(err);
      console.log('Such is life.');
      return false;
    }
  }
  return true;
})()
  .then(success => console.log(success ? 'Done!' : 'Oof!'));
