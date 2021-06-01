import * as ty from '@tybys/ty'
import * as path from 'path'
import * as fs from 'fs-extra'
import * as webpack from 'webpack'

const CopyWebpackPlugin = ty.wrapPlugin('CopyWebpackPlugin', require('copy-webpack-plugin'))

const config: ty.Configuration = {
  target: 'electron',
  entry: {
    main: {
      'mishiro.main': [path.join(__dirname, 'src/ts/main.ts')]
    },
    renderer: {
      'mishiro.renderer': [path.join(__dirname, 'src/ts/renderer.ts')],
      'mishiro.score': [path.join(__dirname, 'src/ts/renderer-score.ts')],
      'mishiro.back': [path.join(__dirname, 'src/ts/renderer-back.ts')]
    }/* ,
    preload: {
      preload: [path.join(__dirname, 'src/ts/preload/preload.ts')]
    } */
  },
  tsconfig: {
    main: path.join(__dirname, 'src/ts/main/tsconfig.json'),
    renderer: path.join(__dirname, 'src/ts/renderer/tsconfig.json')/* ,
    preload: path.join(__dirname, 'src/ts/preload/tsconfig.json') */
  },
  indexHtml: [
    {
      template: 'src/ts/template/index.template.ts',
      filename: 'index.html',
      chunks: ['mishiro.renderer', 'node-modules']
    },
    {
      template: 'src/ts/template/score.template.ts',
      filename: 'score.html',
      chunks: ['mishiro.score', 'node-modules']
    },
    {
      template: 'src/ts/template/back.template.ts',
      filename: 'back.html',
      chunks: ['mishiro.back', 'node-modules']
    }
  ],
  cssLoaderOptions: {
    url: false
  },
  iconSrcDir: 'src/res/icon',
  configureWebpack: {
    // main (config: webpack.Configuration) {
    //   config.plugins = [
    //     ...(config.plugins || []),
    //     new webpack.DefinePlugin({
    //       'process.isLinux': JSON.stringify(process.platform === 'linux')
    //     })
    //   ]
    // },
    main (config: webpack.Configuration) {
      config.plugins = [
        ...(config.plugins || []),
        new CopyWebpackPlugin({
          patterns: [
            { from: path.join(__dirname, 'src/res/banner.svg') }
          ]
        })
      ]
    }
  },
  inno: {
    appid: {
      ia32: '1988B0A7-591C-4EE6-B069-96723508F0D5',
      x64: '76632B3A-54F9-4986-A8DE-445BFECE5116'
    },
    url: 'https://github.com/toyobayashi/mishiro'
  },
  distPath: '../dist',
  nodeExternals: {
    renderer: {
      allowlist: [/webpack/, 'marked', /^vue/]
    }
  },
  packHook: {
    afterInstall (_self, root) {
      const nodeModulesDir = path.join(root, 'node_modules')
      // const lameNode = fs.readFileSync(path.join(nodeModulesDir, 'lame/build/Release/bindings.node'))
      const removeList = [
        '.bin',
        '.cache',
        'nan',
        'node-addon-api',
        'sqlite3/build-tmp-napi-v3',
        'sqlite3/build-tmp-napi-v4',
        'sqlite3/build-tmp-napi-v5',
        'sqlite3/build-tmp-napi-v6',
        'sqlite3/build',
        'sqlite3/deps',
        'sqlite3/node_modules',
        'sqlite3/src',
        'sqlite3/binding.gyp',
        'sqlite3/CHANGELOG.md',
        'sqlite3/CONTRIBUTING.md',
        'sqlite3/README.md',
        'spdlog/.vscode',
        'spdlog/deps',
        'spdlog/src',
        'spdlog/test',
        'spdlog/.clang-format',
        'spdlog/.gitmodules',
        'spdlog/azure-pipelines.yml',
        'spdlog/binding.gyp',
        'spdlog/build.yml',
        'spdlog/index.d.ts',
        'spdlog/README.md',
        'hca-decoder/build',
        'hca-decoder/binding.gyp',
        'hca-decoder/common.gypi',
        'hca-decoder/index.d.ts',
        'hca-decoder/README.md',
        'usm-decrypter/build',
        'usm-decrypter/binding.gyp',
        'usm-decrypter/common.gypi',
        'usm-decrypter/index.d.ts',
        'usm-decrypter/README.md',
        'mishiro-core/deps',
        'mishiro-core/src',
        'mishiro-core/.npmignore',
        'mishiro-core/build',
        'mishiro-core/binding.gyp',
        'mishiro-core/common.gypi',
        'mishiro-core/index.d.ts',
        'mishiro-core/README.md',
        '../package-lock.json',
        '../../config.json'
      ]
      removeList.forEach(p => {
        const tmpPath = path.join(nodeModulesDir, p)
        if (fs.existsSync(tmpPath)) fs.removeSync(tmpPath)
      })
    }
  }
}

export default config
