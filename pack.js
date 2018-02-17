const path = require('path')
const packageJson = require('./package.json')
const pack = require('./src/js/util/packager.js')

const option = {
  platform: 'win32',
  arch: 'ia32',
  electronVersion: packageJson.devDependencies.electron.slice(1),
  distDir: path.join(__dirname, 'dist'),
  ignore: new RegExp(`node_modules|data|release|download|dist|src|screenshot|${'public/img/card'.replace(/\//g, '\\\\')}|${'public/asset/sound/live'.replace(/\//g, '\\\\')}|${'public/asset/sound/voice'.replace(/\//g, '\\\\')}|.gitignore|README|webpack|.eslintrc.json|config.json|manifest.json|package-lock.json|pack.js|count.js|.git|.vscode`),
  versionString: {
    icon: path.join(__dirname, './src/res/icon/mishiro.ico'),
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
