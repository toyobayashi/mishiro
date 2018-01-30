const sourceCount = require('./src/js/sourceCount.js')

sourceCount({
  js: [
    './src/js',
    './src/i18n',
    './src/main.js',
    './src/renderer.js',
    './pack.js',
    './count.js',
    './webpack.config.js',
    './webpack.dll.config.js'
  ],
  vue: ['./src/template'],
  css: ['./src/css'],
  html: ['./public/index.html'],
  markdown: [
    './README.md',
    './LICENSE.md'
  ],
  json: [
    './package.json',
    './.eslintrc.json'
  ]
}).then(data => {
  console.log(data)
})
