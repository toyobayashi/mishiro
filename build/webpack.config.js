const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')

const nativeRequire = (moduleName) => `process.arch === "ia32" ? require("./lib/${moduleName}-ia32.node") : require("./lib/${moduleName}-x64.node")`
const native = (nativeModules) => {
  let externals = {}
  for (let i = 0; i < nativeModules.length; i++) {
    externals[nativeModules[i]] = nativeRequire(nativeModules[i])
  }
  return externals
}

let main = {
  target: 'electron-main',
  entry: path.join(__dirname, '../src/js/main.js'),
  output: {
    path: path.join(__dirname, '../public'),
    filename: 'mishiro.main.js'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  externals: native(['sqlite3', 'hca']),
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': process.env.NODE_ENV === 'production' ? '"production"' : '"development"'
    })
  ]
}

let renderer = {
  target: 'electron-renderer',
  entry: {
    'mishiro.renderer': path.join(__dirname, '../src/js/renderer.js'),
    'mishiro.live': path.join(__dirname, '../src/js/renderer-game.js')
  },
  output: {
    path: path.join(__dirname, '../public'),
    filename: '[name].js'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  module: {
    rules: [{
      test: /\.vue$/,
      exclude: /node_modules/,
      loader: 'vue-loader',
      options: {
        loaders: {
          css: ExtractTextPlugin.extract({
            use: [{
              loader: 'css-loader',
              options: {
                url: false
              }
            }]
          })
        }
        // extractCSS: true
      }
    }]
  },
  plugins: [
    new ExtractTextPlugin('./mishiro.renderer.css'),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new webpack.DllReferencePlugin({
      manifest: require('./manifest.json')
    })
  ]
}

if (process.env.NODE_ENV === 'production') {
  const uglifyjs = new UglifyJSPlugin({
    uglifyOptions: {
      ecma: 8,
      output: {
        comments: false,
        beautify: false
      },
      warnings: false
    }
  })
  renderer.plugins.push(uglifyjs)
  main.plugins.push(uglifyjs)
}

module.exports = [renderer, main]
