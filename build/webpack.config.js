const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
// const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')
const nativeExternals = require('./native-externals.js')

let main = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
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
  externals: Object.assign({}, nativeExternals('./lib', ['sqlite3', 'hca'])),
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

let renderer = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
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
          css: [
            MiniCssExtractPlugin.loader,
            { loader: 'css-loader', options: { url: false } }
          ]
        }
      }
    }, {
      test: /\.css$/,
      exclude: /node_modules/,
      use: [
        MiniCssExtractPlugin.loader,
        { loader: 'css-loader', options: { url: false } }
      ]
    }]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new webpack.DllReferencePlugin({
      manifest: require('./manifest.json'),
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
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  }
}

module.exports = [renderer, main]
