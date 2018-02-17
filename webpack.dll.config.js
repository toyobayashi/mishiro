const webpack = require('webpack')
const path = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const pkg = require('./package.json')

const renderer = {
  target: 'electron-renderer',
  entry: {
    vendor: Object.keys(pkg.dependencies)
  },
  node: {
    __filename: false,
    __dirname: false
  },
  output: {
    path: path.join(__dirname, './public'),
    filename: 'dll.js',
    library: 'dll'
  },
  plugins: [
    new UglifyJSPlugin({
      uglifyOptions: {
        ecma: 8,
        output: {
          comments: false,
          beautify: false
        },
        warnings: false
      }
    }),
    new webpack.DllPlugin({
      path: path.join(__dirname, './manifest.json'),
      name: 'dll'
    })
  ]
}

if (process.env.NODE_ENV == 'production') {
  renderer.entry.vendor.push('vue/dist/vue.runtime.min.js')
} else {
  renderer.entry.vendor.push('vue/dist/vue.runtime.esm.js')
}

module.exports = renderer
