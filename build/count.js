const path = require('path')
const sourceCount = require('../src/js/util/sourceCount.js')
const getPath = r => path.join(__dirname, '..', r)

sourceCount({
  js: [
    getPath('./src/js'),
    getPath('./src/i18n'),
    getPath('./src/main.js'),
    getPath('./src/renderer.js'),
    getPath('./build/pack.js'),
    getPath('./build/count.js'),
    getPath('./build/webpack.config.js'),
    getPath('./build/webpack.dll.config.js')
  ],
  vue: [getPath('./src/template')],
  css: [getPath('./src/css')],
  html: [getPath('./public/index.html')],
  cpp: [getPath('./src/cpp/hca/hca.cpp')],
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
