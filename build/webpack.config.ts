import * as webpack from 'webpack'
import MiniCssExtractPlugin = require('mini-css-extract-plugin')
import OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
// import ExtractTextPlugin = require('extract-text-webpack-plugin')
import UglifyJSPlugin = require('uglifyjs-webpack-plugin')
import * as path from 'path'

let main: webpack.Configuration = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  target: 'electron-main',
  entry: path.join(__dirname, '../src/ts/main.ts'),
  output: {
    path: path.join(__dirname, '../public'),
    filename: 'mishiro.main.js'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      loader: 'ts-loader'
    }]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  externals: nativeExternals('./lib', ['sqlite3', 'hca']),
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

let renderer: webpack.Configuration = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  target: 'electron-renderer',
  entry: {
    'mishiro.renderer': path.join(__dirname, '../src/ts/renderer.ts'),
    'mishiro.live': path.join(__dirname, '../src/ts/renderer-game.ts')
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
    }, {
      test: /\.ts$/,
      exclude: /node_modules/,
      loader: 'ts-loader',
      options: {
        appendTsSuffixTo: [/\.vue$/]
      }
    }]
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.css']
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

export default [renderer, main]

function nativeExternals (relativePath: string, nativeModules: string[]): webpack.ExternalsObjectElement {
  let externals: webpack.ExternalsObjectElement = {}
  for (const moduleName of nativeModules) {
    externals[moduleName] = `require("${relativePath}/${moduleName}-" + process.arch + ".node")`
  }
  return externals
}
