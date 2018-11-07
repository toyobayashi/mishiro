import { arch as packagerArch, Options } from 'electron-packager'
import { join } from 'path'
// import { homedir } from 'os'
import * as pkg from '../package.json'

if (process.argv.slice(2)[0] !== 'ia32' && process.argv.slice(2)[0] !== 'x64') {
  throw new Error('ARCH requrie "ia32" or "x64"')
}
export const arch = process.argv.slice(2)[0] as packagerArch

export const productionPackage = {
  name: pkg.name,
  version: pkg.version,
  main: pkg.main,
  author: pkg.author,
  repository: pkg.repository,
  license: pkg.license,
  dependencies: pkg.dependencies,
  _commit: require('child_process').execSync('git rev-parse HEAD').toString().replace(/[\r\n]/g, ''),
  _commitDate: new Date(require('child_process').execSync('git log -1').toString().match(/Date:\s*(.*?)\n/)[1]).toISOString()
}

const packagerOptions: Options = {
  dir: join(__dirname, '..'),
  out: join(__dirname, '../..', 'dist'),
  // platform: 'win32',
  arch: arch,
  ignore: /node_modules|src|script|README|tslint\.json|tsconfig|package-lock\.json|\.git|\.vscode|\.npmrc/,
  appCopyright: 'Copyright (C) 2017-2018 Toyobayashi',
  download: {
    // cache: process.platform === 'win32' ? join(homedir(), '.electron') : join(homedir(), '.cache/electron'),
    mirror: process.env.npm_config_electron_mirror || 'https://npm.taobao.org/mirrors/electron/'
  },
  overwrite: true
}

if (process.platform === 'win32') {
  packagerOptions.icon = join(__dirname, '../src/res/icon/mishiro.ico')
} else if (process.platform === 'darwin') {
  packagerOptions.icon = join(__dirname, '../src/res/icon/mishiro.icns')
}

export { packagerOptions }
