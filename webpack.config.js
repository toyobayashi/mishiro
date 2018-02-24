const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')

let renderer = {
  target: 'electron-renderer',
  entry: './src/renderer.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'mishiro.min.js'
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
        loaders: {},
        extractCSS: true
        // other vue-loader options go here
      }
    }, {
      test: /\.(eot|woff|svg|woff2|ttf|otf)$/,
      exclude: /node_modules/,
      loader: 'file-loader?name=./asset/font/[name].[ext]?[hash]'
    }, {
      test: /\.(png|jpg|gif)$/,
      exclude: /node_modules/,
      loader: 'url-loader?limit=8192&name=./img/[name].[ext]?[hash]'
    }]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.runtime.esm.js'
    }
  },
  plugins: [
    new ExtractTextPlugin('./mishiro.min.css'),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new webpack.DllReferencePlugin({
      manifest: require('./manifest.json')
    })
  ]
}

const nativeRequire = (moduleName) => `process.arch === "ia32" ? require("./bin/${moduleName}-ia32.node") : require("./bin/${moduleName}-x64.node")`
const native = (nativeModules) => {
  let externals = {}
  for (let i = 0; i < nativeModules.length; i++) {
    externals[nativeModules[i]] = nativeRequire(nativeModules[i])
  }
  return externals
}

let main = {
  target: 'electron-main',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, '.'),
    filename: 'main.min.js'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  externals: native(['sqlite3', 'hca']),
  plugins: []
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
  renderer.resolve.alias['vue$'] = 'vue/dist/vue.runtime.min.js'
  renderer.plugins.push(uglifyjs)
  main.plugins.push(uglifyjs)
}

module.exports = [renderer, main]
