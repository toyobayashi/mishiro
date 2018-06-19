import webpack from 'webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import UglifyJSPlugin from 'uglifyjs-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import path from 'path'
import fs from 'fs-extra'
import pkg from '../package.json'

export const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const uglify = new UglifyJSPlugin({
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

export const dll: webpack.Configuration = {
  mode,
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
    library: '__dll_[hash]__'
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, 'manifest.json'),
      name: '__dll_[hash]__',
      context: __dirname
    })
  ],
  optimization: {
    minimizer: [uglify]
  }
}

export const main: webpack.Configuration = {
  mode,
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
    }, {
      test: /\.node$/,
      loader: 'native-addon-loader',
      options: {
        name: './node/[name].[ext]'
      }
    }]
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', '.node']
  },
  optimization: {
    minimizer: [uglify]
  }
}

export const manifest: any = path.join(__dirname, 'manifest.json')

export function renderer (manifestPath: string): webpack.Configuration {
  const manifestJson = fs.readJsonSync(manifestPath)
  console.log('Global variable name: ' + manifestJson.name)
  return {
    mode,
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
        loader: 'vue-loader'
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
        manifest: manifestJson,
        context: __dirname
      }),
      new VueLoaderPlugin()
    ],
    optimization: {
      minimizer: [
        uglify,
        new OptimizeCSSAssetsPlugin({})
      ]
    }
  }
}
