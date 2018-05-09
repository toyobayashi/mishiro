import packager from 'electron-packager'
import path from 'path'
import os from 'os'
import fs from 'fs-extra'
import { exec, ExecOptions } from 'child_process'
import pkg from '../package.json'
const prod = require('./webpack.ts')
const args = process.argv.slice(2)
const _arch = args[0] as packager.arch || 'x64'
const execAsync = (cmd: string, options?: ExecOptions) => new Promise((resolve, reject) => {
  exec(cmd, options, (err, stdout) => {
    if (!err) resolve(stdout)
    else reject(err)
  })
})
Promise.resolve().then(() => {
  console.log('rebuild hca...')
  return execAsync(`npm run reb:hca-${_arch}`, { cwd: path.join(__dirname, '..') })
}).then(() => {
  console.log('bundle production code...')
  return prod()
}).then(() => {
  console.log('package...')
  return packager({
    dir: path.join(__dirname, '..'),
    out: path.join(__dirname, '..', 'dist'),
    platform: 'win32',
    arch: _arch,
    icon: path.join(__dirname, '../src/res/icon/mishiro.ico'),
    ignore: /node_modules|build|data|release|download|dist|src|screenshot|public\/img\/card|public\/asset\/sound\/live|public\/asset\/sound\/voice|public\/asset\/score|README|\.eslintrc\.json|tslint\.json|tsconfig\.json|config\.json|package-lock\.json|\.bin|\.git|\.vscode/,
    appCopyright: 'Copyright (C) 2017 Toyobayashi',
    download: {
      cache: path.join(os.homedir(), '.electron'),
      mirror: process.env.ELECTRON_MIRROR || 'https://npm.taobao.org/mirrors/electron/'
    },
    overwrite: true
  })
}).then(appPaths => {
  let dirName: string | string[] = path.basename(appPaths[0]).split('-')
  dirName.splice(1, 0, `v${pkg.version}`)
  dirName = dirName.join('-')
  const newPath = path.join(path.dirname(appPaths[0]), dirName)
  console.log('install sqlite3...')
  return execAsync(
    `npm install sqlite3 --no-save --build-from-source --runtime=electron --target=${pkg.devDependencies.electron.replace(/\^|~/g, '')} --target_arch=${_arch} --dist-url=https://atom.io/download/electron`,
    { cwd: path.join(appPaths[0], './resources/app') }
  ).then(() => {
    fs.removeSync(path.join(appPaths[0], './resources/app/node_modules/nan'))
    console.log(appPaths[0], ' -> ', newPath)
    fs.moveSync(appPaths[0], newPath)
  })
}).catch(err => console.log(err))
