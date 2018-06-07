import packageManager from 'electron-packager'
import path from 'path'
import os from 'os'
import fs from 'fs-extra'
import pkg from '../package.json'

if (process.argv.slice(2)[0] !== 'ia32' && process.argv.slice(2)[0] !== 'x64') {
  throw new Error('ARCH requrie "ia32" or "x64"')
}
export const arch = process.argv.slice(2)[0] as packageManager.arch

export const productionPackage = {
  name: pkg.name,
  version: pkg.version,
  main: pkg.main,
  author: pkg.author,
  repository: pkg.repository,
  license: pkg.license
}

function nativeCache (modules: string[], cacheRoot: string) {
  const cache: {
    [moduleName: string]: {
      path: string,
      exist: boolean
    }
  } = {}
  for (const moduleName of modules) {
    const modulePath = path.join(cacheRoot, moduleName)
    cache[moduleName] = {
      path: modulePath,
      exist: fs.existsSync(modulePath)
    }
  }
  return cache
}

export const cache = nativeCache(['hca-decoder', 'sqlite3'],
  path.join(__dirname, `../cache/electron-v${pkg.devDependencies.electron.match(/[0-9]+\.[0-9]+/)}-win32-${arch}`))

export const packagerOptions: packageManager.Options = {
  dir: path.join(__dirname, '..'),
  out: path.join(__dirname, '..', 'dist'),
  platform: 'win32',
  arch: arch,
  icon: path.join(__dirname, '../src/res/icon/mishiro.ico'),
  ignore: /node_modules|build|cache|data|release|download|dist|src|script|public\/img\/card|public\/asset\/sound\/live|public\/asset\/sound\/voice|public\/asset\/score|README|tslint\.json|tsconfig\.json|config\.json|package\.json|package-lock\.json|\.git|\.vscode|binding\.gyp/,
  appCopyright: 'Copyright (C) 2017 Toyobayashi',
  download: {
    cache: path.join(os.homedir(), '.electron'),
    mirror: process.env.ELECTRON_MIRROR || 'https://npm.taobao.org/mirrors/electron/'
  },
  overwrite: true
}
