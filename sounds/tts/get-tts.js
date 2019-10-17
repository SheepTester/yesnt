// node sounds/tts/get-tts.js

const querystring = require('querystring');
const path = require('path');
const {text, fetch, download} = require('./download');

const lines = ["Relax your hands.","Raise your hand if you need Kleenex before we start power breath.","Second round, power breath, raise your hand if you need Kleenex.","Raise your hand if you need Kleenex.","Last round of power breath, hands in position.","And loose fists by your shoulders, elbows by your body.","Take a normal breath in, and breathe out, and together:","up,","down,","Let’s take a deep breath in, as we breathe out let’s relax our breath, relax our whole body.","Let’s take a deep breath in for the \"om\" sound.","Breathe in.","Stop! Your vagus nerve is not fully activated!"];

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
