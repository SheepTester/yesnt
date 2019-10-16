const https = require('https');
const fs = require('fs');

function text(response) {
  return new Promise(res => {
    // https://stackoverflow.com/a/11826486
    let body = '';
    response.on('data', chunk => body += chunk);
    response.on('end', () => res(body));
  });
}

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, res)
      // https://stackoverflow.com/a/22907134
      .on('error', rej);
  });
}

module.exports = {
  text,
  fetch: (options, withRequest) =>
    new Promise((res, rej) => {
      const request = https.request(options, res)
        .on('error', rej);
      if (withRequest) withRequest(request);
      request.end();
    }),
  download: (url, file) =>
    // https://stackoverflow.com/a/11944984
    get(url)
      .then(response => new Promise(res =>
        response.pipe(fs.createWriteStream(file))
          // https://stackoverflow.com/a/11448311
          .on('finish', res)))
};
