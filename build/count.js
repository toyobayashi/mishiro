const path = require('path')
const sourceCount = require('../src/js/util/source-count.js')
const getPath = r => path.join(__dirname, '..', r)

sourceCount({
  js: [
    getPath('./src/js'),
    getPath('./build/pack.js'),
    getPath('./build/count.js'),
    getPath('./build/webpack.config.js'),
    getPath('./build/webpack.dll.config.js')
  ],
  vue: [getPath('./src/vue')],
  css: [getPath('./src/css')],
  html: [
    getPath('./public/index.html'),
    getPath('./public/game.html')
  ],
  cpp: [getPath('./src/cpp/hca/hca.cpp')],
  batch: [getPath('./.bin')],
  markdown: [
    getPath('./README.md'),
    getPath('./LICENSE.md')
  ],
  json: [
    getPath('./package.json'),
    getPath('./.eslintrc.json')
  ]
}).then(data => {
  console.log(data)
})
