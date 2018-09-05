import * as webpack from 'webpack'
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin'
import * as OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import * as UglifyJSPlugin from 'uglifyjs-webpack-plugin'
import * as HtmlWebpackPlugin from 'html-webpack-plugin'
import { VueLoaderPlugin } from 'vue-loader'
import * as path from 'path'
import * as webpackNodeExternals from 'webpack-node-externals'

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
  devtool: mode === 'production' ? void 0 : 'eval-source-map',
  entry: {
    'mishiro.main': [path.join(__dirname, '../src/ts/main.ts')]
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
      test: /\.ts$/,
      exclude: /node_modules/,
      loader: 'ts-loader'
    }/* , {
      test: /\.node$/,
      loader: 'native-addon-loader',
      options: {
        name: './node/[name].[ext]'
      }
    } */]
  },
  externals: [webpackNodeExternals()],
  resolve: {
    extensions: ['.ts', '.js', '.json'/* , '.node' */]
  },
  optimization: {
    minimizer: [uglify]
  }
}

// export const manifest: any = path.join(__dirname, 'manifest.json')

export const renderer: webpack.Configuration = {
  mode,
  target: 'electron-renderer',
  devtool: mode === 'production' ? void 0 : 'eval-source-map',
  entry: {
    'mishiro.renderer': [path.join(__dirname, '../src/ts/renderer.ts')],
    'mishiro.live': [path.join(__dirname, '../src/ts/renderer-game.ts')],
    'mishiro.back': [path.join(__dirname, '../src/ts/renderer-back.ts')]
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
  externals: [webpackNodeExternals({
    whitelist: [/vue/]
  })],
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    /* new webpack.DllReferencePlugin({
      manifest: manifestJson,
      context: __dirname
    }), */
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      inject: false,
      template: path.join(__dirname, '../src/ts/template/index.template.ts'),
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      template: path.join(__dirname, '../src/ts/template/game.template.ts'),
      filename: 'game.html'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      template: path.join(__dirname, '../src/ts/template/back.template.ts'),
      filename: 'back.html'
    })
  ],
  optimization: {
    minimizer: [
      uglify,
      new OptimizeCSSAssetsPlugin({})
    ],
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'dll',
          chunks: 'all'
        }
      }
    }
  }
}
