import { Configuration, HotModuleReplacementPlugin, DefinePlugin } from 'webpack'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin'
import * as OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import * as ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import * as webpackNodeExternals from 'webpack-node-externals'
import config from './config'
import { getPath } from './util'
import * as TerserWebpackPlugin from 'terser-webpack-plugin'
import * as serveAsar from 'express-serve-asar'

const cssLoader = [
  config.mode === 'production' ? MiniCssExtractPlugin.loader : 'vue-style-loader',
  { loader: 'css-loader', options: { url: false } }
]

const htmlMinify = config.mode === 'production' ? {
  removeComments: true,
  collapseWhitespace: true,
  removeAttributeQuotes: true,
  collapseBooleanAttributes: true,
  removeScriptTypeAttributes: true
} : false

export const mainConfig: Configuration = {
  mode: config.mode,
  target: 'electron-main',
  context: getPath(),
  entry: {
    'mishiro.main': [getPath('src/ts/main.ts')]
  },
  output: {
    path: getPath(config.outputPath),
    filename: '[name].js'
  },
  node: false,
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: config.mode !== 'production',
              configFile: getPath('./src/ts/main/tsconfig.json')
            }
          }
        ]
      },
      {
        test: /\.(jpg|png|ico|icns)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: `./${config.iconOutDir}/[name].[ext]`
            }
          }
        ]
      }
    ]
  },
  externals: [webpackNodeExternals()],
  resolve: {
    alias: {
      '@': getPath('src')
    },
    extensions: ['.ts', '.js', 'json']
  },
  plugins: [
    new DefinePlugin({
      'process.isLinux': JSON.stringify(process.platform === 'linux')
    })
  ]
}

// export const manifest: any = path.join(__dirname, 'manifest.json')

export const preloadConfig: Configuration = {
  mode: config.mode,
  context: getPath(),
  target: 'electron-renderer',
  entry: {
    preload: [getPath('./src/ts/preload/preload.ts')]
  },
  output: {
    filename: '[name].js',
    path: getPath(config.outputPath)
  },
  node: false,
  externals: [webpackNodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: config.mode !== 'production',
              configFile: getPath('./src/ts/preload/tsconfig.json')
            }
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      '@': getPath('src')
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  }
}

export const rendererConfig: Configuration = {
  mode: config.mode,
  context: getPath(),
  target: 'web',
  entry: {
    'mishiro.renderer': [getPath('src/ts/renderer.ts')],
    'mishiro.live': [getPath('src/ts/renderer-game.ts')],
    'mishiro.score': [getPath('src/ts/renderer-score.ts')]
  },
  output: {
    path: getPath(config.outputPath),
    filename: '[name].js',
    chunkFilename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.ts(x)?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              transpileOnly: config.mode !== 'production',
              configFile: getPath('./src/ts/renderer/tsconfig.json')
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          ...cssLoader
        ]
      }/* ,
      {
        test: /\.styl(us)?$/,
        use: [
          ...cssLoader,
          'stylus-loader'
        ]
      } */
    ]
  },
  resolve: {
    alias: {
      '@': getPath('src')
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.css', '.styl', '.json']
  },
  // externals: [webpackNodeExternals({
  //   whitelist: mode === 'production' ? [/vue/] : [/webpack/]
  // })],
  plugins: [
    new VueLoaderPlugin(),
    /* new webpack.DllReferencePlugin({
      manifest: manifestJson,
      context: __dirname
    }), */
    new HtmlWebpackPlugin({
      template: getPath('src/ts/template/index.template.ts'),
      filename: 'index.html',
      chunks: ['mishiro.renderer', 'common', 'dll'],
      minify: htmlMinify
    }),
    new HtmlWebpackPlugin({
      template: getPath('src/ts/template/game.template.ts'),
      filename: 'game.html',
      chunks: ['mishiro.live', 'common', 'dll'],
      minify: htmlMinify
    }),
    new HtmlWebpackPlugin({
      template: getPath('src/ts/template/score.template.ts'),
      filename: 'score.html',
      chunks: ['mishiro.score', 'common', 'dll'],
      minify: htmlMinify
    })
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        dll: {
          name: 'dll',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          chunks: 'initial'
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: -20,
          chunks: 'initial',
          reuseExistingChunk: true
        }
      }
    }
  }
}

if (config.mode === 'production') {
  // (rendererConfig.output as any).chunkFilename = '[name].js'
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
  mainConfig.optimization = {
    ...(mainConfig.optimization || {}),
    minimizer: [terser()]
  }
  rendererConfig.plugins = [
    ...(rendererConfig.plugins || []),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]
  rendererConfig.optimization = {
    ...(rendererConfig.optimization || {}),
    minimizer: [
      terser(),
      new OptimizeCSSAssetsPlugin({})
    ]
  }
  preloadConfig.optimization = {
    ...(mainConfig.optimization || {}),
    minimizer: [terser()]
  }
} else {
  rendererConfig.devServer = {
    stats: config.statsOptions,
    hot: true,
    host: config.devServerHost,
    inline: true,
    contentBase: getPath(config.contentBase),
    publicPath: config.publicPath,
    before (app) {
      app.use(serveAsar(getPath(config.contentBase)))
    }
  }
  rendererConfig.devtool = mainConfig.devtool = preloadConfig.devtool = 'eval-source-map'

  rendererConfig.plugins = [
    ...(rendererConfig.plugins || []),
    new HotModuleReplacementPlugin(),
    new ForkTsCheckerWebpackPlugin({
      tslint: true,
      tsconfig: getPath('./src/ts/renderer/tsconfig.json'),
      vue: true
    })
  ]

  preloadConfig.plugins = [
    ...(preloadConfig.plugins || []),
    new ForkTsCheckerWebpackPlugin({
      tslint: true,
      tsconfig: getPath('./src/ts/preload/tsconfig.json')
    })
  ]

  mainConfig.plugins = [
    ...(mainConfig.plugins || []),
    new ForkTsCheckerWebpackPlugin({
      tslint: true,
      tsconfig: getPath('./src/ts/main/tsconfig.json')
    })
  ]

  if (config.publicPath) {
    rendererConfig.output && (rendererConfig.output.publicPath = config.publicPath)
  }
}
