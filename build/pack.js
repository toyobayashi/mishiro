const path = require('path')
const packageJson = require('../package.json')
const pack = require('../src/js/util/packager.js')

const option = {
  platform: 'win32',
  arch: process.argv[2] ? process.argv[2] : 'ia32',
  electronVersion: packageJson.devDependencies.electron,
  packDir: path.join(__dirname, '..'),
  distDir: path.join(__dirname, '../dist'),
  ignore: new RegExp(`node_modules|build|data|release|download|dist|src|screenshot|public/img/card|public/asset/sound/live|public/asset/sound/voice|public/asset/score|.gitignore|README|.eslintrc.json|config.json|package-lock.json|.git|.vscode`.replace(/\//g, '\\\\')),
  versionString: {
    icon: path.join(__dirname, '../src/res/icon/mishiro.ico'),
    'file-version': packageJson.version,
    'product-version': packageJson.version,
    'version-string': {
      // 'Block Header': '080404b0',
      FileDescription: packageJson.description,
      InternalName: packageJson.name,
      OriginalFilename: packageJson.name + '.exe',
      ProductName: packageJson.name,
      CompanyName: packageJson.author.name,
      LegalCopyright: 'Copyright (C) 2017 Toyobayashi'
    }
  }
}

pack(option)
