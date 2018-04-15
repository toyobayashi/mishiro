const path = require('path')
const sourceCount = require('../src/js/source-count.js')
const getPath = r => path.join(__dirname, '..', r)

sourceCount({
  ts: [
    getPath('./src/ts'),
    getPath('./src/@types'),
    getPath('./build/webpack.config.ts'),
    getPath('./build/webpack.dll.config.ts')
  ],
  js: [
    getPath('./src/js'),
    getPath('./build/pack.js'),
    getPath('./build/count.js'),
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
    getPath('./tslint.json'),
    getPath('./tsconfig.json'),
    getPath('./build/tsconfig.webpack.json')
  ]
}).then(data => {
  console.log(data)
})
