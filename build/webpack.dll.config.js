const webpack = require('webpack')
const path = require('path')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const pkg = require('../package.json')

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
    path: path.join(__dirname, '../public'),
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
      path: path.join(__dirname, 'manifest.json'),
      name: 'dll'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': process.env.NODE_ENV === 'production' ? '"production"' : '"development"'
    })
  ]
}

module.exports = renderer
