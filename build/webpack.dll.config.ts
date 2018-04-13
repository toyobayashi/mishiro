import * as webpack from 'webpack'
import * as path from 'path'
import UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const pkg = require('../package.json')

const renderer = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
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
    new webpack.DllPlugin({
      path: path.join(__dirname, 'manifest.json'),
      name: 'dll',
      context: __dirname
    })
  ],
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        parallel: true,
        cache: true,
        uglifyOptions: {
          ecma: 8,
          output: {
            comments: false,
            beautify: false
          },
          warnings: false
        }
      })
    ]
  }
}

export default renderer
