import * as webpack from 'webpack'
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin'
import * as OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import * as path from 'path'
import * as webpackNodeExternals from 'webpack-node-externals'
import ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
import { publicPath } from './config.json'
const TerserWebpackPlugin = require('terser-webpack-plugin')

export const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'

/* export const dll: webpack.Configuration = {
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
} */

export const main: webpack.Configuration = {
  mode,
  target: 'electron-main',
  context: path.join(__dirname, '..'),
  entry: {
    'mishiro.main': [path.join(__dirname, '../src/ts/main.ts')]
  },
  output: {
    path: path.join(__dirname, '../..', publicPath),
    filename: '[name].js'
  },
  node: false,
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      loader: 'ts-loader'
    }, {
      test: /\.(jpg|png|ico|icns)$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: './[name].[ext]'
        }
      }]
    }]
  },
  externals: [webpackNodeExternals()],
  resolve: {
    extensions: ['.ts', '.js', '.json']
  }
}

// export const manifest: any = path.join(__dirname, 'manifest.json')

export const renderer: webpack.Configuration = {
  mode,
  target: 'electron-renderer',
  context: path.join(__dirname, '..'),
  entry: {
    'mishiro.renderer': [path.join(__dirname, '../src/ts/renderer.ts')],
    'mishiro.live': [path.join(__dirname, '../src/ts/renderer-game.ts')]/* ,
    'mishiro.back': [path.join(__dirname, '../src/ts/renderer-back.ts')] */
  },
  output: {
    path: path.join(__dirname, '../..', publicPath),
    filename: '[name].js'
  },
  node: false,
  module: {
    rules: [{
      test: /\.vue$/,
      exclude: /node_modules/,
      loader: 'vue-loader'
    }, {
      test: /\.css$/,
      exclude: /node_modules/,
      use: [
        mode === 'production' ? MiniCssExtractPlugin.loader : 'vue-style-loader',
        { loader: 'css-loader', options: { url: false } }
      ]
    }, {
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/],
            transpileOnly: mode !== 'production'
          }
        }
      ]
    }]
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.css']
  },
  externals: [webpackNodeExternals({
    whitelist: mode === 'production' ? [/vue/] : [/webpack/]
  })],
  plugins: [
    new VueLoaderPlugin(),
    /* new webpack.DllReferencePlugin({
      manifest: manifestJson,
      context: __dirname
    }), */
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/ts/template/index.template.ts'),
      filename: 'index.html',
      chunks: ['mishiro.renderer', 'common', 'dll']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/ts/template/game.template.ts'),
      filename: 'game.html',
      chunks: ['mishiro.live', 'common', 'dll']
    })/* ,
    new HtmlWebpackPlugin({
      inject: false,
      template: path.join(__dirname, '../src/ts/template/back.template.ts'),
      filename: 'back.html'
    }) */
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'common',
      cacheGroups: {
        dll: {
          test: /[\\/]node_modules[\\/]/,
          name: 'dll'
        }
      }
    }
  }
}

if (mode === 'production') {
  const terser = () => new TerserWebpackPlugin({
    parallel: true,
    cache: true,
    terserOptions: {
      ecma: 8,
      output: {
        beautify: false
      }
    }
  })
  main.optimization = {
    minimizer: [terser()]
  }
  renderer.plugins = [
    ...(renderer.plugins || []),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]
  renderer.optimization = {
    ...(renderer.optimization || {}),
    minimizer: [
      terser(),
      new OptimizeCSSAssetsPlugin({})
    ]
  }
} else {
  renderer.devtool = main.devtool = 'eval-source-map'
  if (renderer.output) renderer.output.publicPath = publicPath
  renderer.plugins = [
    ...(renderer.plugins || []),
    new ForkTsCheckerWebpackPlugin({
      vue: true,
      tslint: true
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
}
