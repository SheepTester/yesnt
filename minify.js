const UglifyJS = require('uglify-es')
const fs = require('fs')
const Path = require('path')

function read (path) {
  return new Promise((res, rej) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) rej(err)
      else res(data)
    })
  })
}

function write (path, data) {
  return new Promise((res, rej) => {
    fs.writeFile(path, data, err => {
      if (err) rej(err)
      else res()
    })
  })
}

function minify (js) {
  const result = UglifyJS.minify(js, {
    compress: {
      drop_console: true,
      keep_fargs: false,
      warnings: true
    },
    toplevel: true
  })
  if (result.error) throw new Error(result.error)
  return result.code
}

const fatScriptRegex = /<script(?:(?: type="text\/javascript")?>([^\0]+?)| src=+"([^"]+)"(?: charset="utf-8")?>)<\/script>/g

const noWhitespaceRegex = /\s*\r?\n\s*/g

;(async () => {
  const proms = []
  const html = (await read(Path.resolve(__dirname, './source.html')))
    .replace(fatScriptRegex, (match, js, path) => {
      if (js) {
        proms.push(Promise.resolve(js))
      } else {
        proms.push(read(Path.resolve(__dirname, path)))
      }
      // assumes HTML source does not contain __YEET__
      return '__YEET__'
    })
  const js = (await Promise.all(proms)).join('\n')
  console.log('JS obtained; minifying then writing...');
  await Promise.all([
    write(
      Path.resolve(__dirname, './index.html'),
      // replace first __YEET__ with script tag to minified JS and remove the rest
      html.replace('__YEET__', '<script src="./yesnt.min.js" charset="utf-8"></script>')
        .replace(/__YEET__/g, '')
        .replace(noWhitespaceRegex, '')
    ),
    write(Path.resolve(__dirname, './yesnt.min.js'), minify(js))
  ])
  console.log('Done!')
})()
  .catch(err => {
    console.log('uwu oopsie whoopsie mucky wucky:')
    console.log(err)
  })
