import { arch as packagerArch, Options } from 'electron-packager'
import { join } from 'path'
import { homedir } from 'os'
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
  dependencies: pkg.dependencies
}

export const packagerOptions: Options = {
  dir: join(__dirname, '..'),
  out: join(__dirname, '../..', 'dist'),
  // platform: 'win32',
  arch: arch,
  icon: join(__dirname, '../src/res/icon', process.platform === 'win32' ? 'mishiro.ico' : 'mishiro.icns'),
  ignore: /node_modules|src|script|README|tslint\.json|tsconfig\.json|package-lock\.json|\.git|\.vscode|\.npmrc/,
  appCopyright: 'Copyright (C) 2017 Toyobayashi',
  download: {
    cache: join(homedir(), '.electron'),
    mirror: process.env.npm_config_electron_mirror || 'https://npm.taobao.org/mirrors/electron/'
  },
  overwrite: true
}
