import packager from 'electron-packager'
import path from 'path'
import os from 'os'
import fs from 'fs-extra'
import { exec, ExecOptions } from 'child_process'
import pkg from '../package.json'
import { prod } from './webpack'
import { ilog, wlog, elog } from './rainbow'
import { zip } from 'zauz'

const productionPackage = {
  name: pkg.name,
  version: pkg.version,
  main: pkg.main,
  dependencies: {
    sqlite3: '^4.0.0'
  }
}

const args = process.argv.slice(2)
const _arch = args[0] as packager.arch || 'x64'

interface CacheObject {
  path: string,
  exist?: boolean
}

const cacheRoot = path.join(__dirname, `../cache/electron-v${pkg.devDependencies.electron.substr(1, 3)}-win32-${_arch}`)

const cache: { hca: CacheObject; sqlite3: CacheObject } = {
  hca: {
    path: path.join(cacheRoot, 'hca'),
    exist: fs.existsSync(path.join(cacheRoot, 'hca'))
  },
  sqlite3: {
    path: path.join(cacheRoot, 'sqlite3'),
    exist: fs.existsSync(path.join(cacheRoot, 'sqlite3'))
  }
}
const execAsync = (cmd: string, options?: ExecOptions) => {
  return new Promise((resolve, reject) => {
    exec(cmd, options, (err, _stdout) => {
      if (!err) resolve()
      else reject(err)
    })
    // childProcess.stdout.on('data', chunk => log(chunk.toString()))
    // childProcess.stderr.on('data', chunk => log(chunk.toString()))
  }) as Promise<void>
}

Promise.resolve().then(() => {
  if (cache.hca.exist) return
  ilog(`[${new Date().toLocaleString()}] Rebuild hca...`)
  return execAsync(`npm run hca --arch=${_arch}`, { cwd: path.join(__dirname, '..') })
}).then(() => {
  ilog(`[${new Date().toLocaleString()}] Bundle production code...`)
  return prod(() => ilog(`[${new Date().toLocaleString()}] Packaging App...`))
}).then(() => {
  return packager({
    dir: path.join(__dirname, '..'),
    out: path.join(__dirname, '..', 'dist'),
    platform: 'win32',
    arch: _arch,
    icon: path.join(__dirname, '../src/res/icon/mishiro.ico'),
    ignore: /node_modules|build|cache|data|release|download|dist|src|script|public\/img\/card|public\/asset\/sound\/live|public\/asset\/sound\/voice|public\/asset\/score|README|tslint\.json|tsconfig\.json|config\.json|package\.json|package-lock\.json|\.git|\.vscode|binding\.gyp/,
    appCopyright: 'Copyright (C) 2017 Toyobayashi',
    download: {
      cache: path.join(os.homedir(), '.electron'),
      mirror: process.env.ELECTRON_MIRROR || 'https://npm.taobao.org/mirrors/electron/'
    },
    overwrite: true
  })
}).then(appPaths => {
  ilog(`[${new Date().toLocaleString()}] Write package.json...`)
  fs.writeFileSync(path.join(appPaths[0], './resources/app', 'package.json'), JSON.stringify(productionPackage), 'utf8')

  let dirName: string | string[] = path.basename(appPaths[0]).split('-')
  dirName.splice(1, 0, `v${pkg.version}`)
  dirName = dirName.join('-')
  const newPath = path.join(path.dirname(appPaths[0]), dirName)

  if (cache.hca.exist) {
    fs.copySync(path.join(cache.hca.path, 'hca.node'), path.join(appPaths[0], './resources/app/public/addon/hca.node'))
  }

  if (cache.sqlite3.exist) {
    fs.copySync(path.join(cache.sqlite3.path), path.join(appPaths[0], './resources/app/node_modules/sqlite3'))
    return { appPaths, newPath }
  }

  ilog(`[${new Date().toLocaleString()}] Installing Dependencies...`)
  return execAsync(
    `npm install --production --no-save --build-from-source --runtime=electron --target=${pkg.devDependencies.electron.replace(/\^|~/, '')} --target_arch=${_arch} --dist-url=https://atom.io/download/electron`,
    { cwd: path.join(appPaths[0], './resources/app') }
  ).then(() => {
    ilog(`[${new Date().toLocaleString()}] Resolving 'sqlite3' production code...`)
    const sqlite3AddonDir = fs.readdirSync(path.join(appPaths[0], './resources/app/node_modules/sqlite3/lib/binding'))[0]
    const lines = fs.readFileSync(path.join(appPaths[0], './resources/app/node_modules/sqlite3/lib/sqlite3.js'), 'utf8').split(/\r?\n/)
    lines[3] = `var binding = require('./binding/${sqlite3AddonDir}/node_sqlite3.node');`
    lines.splice(0, 1)
    lines.splice(1, 1)
    fs.writeFileSync(path.join(appPaths[0], './resources/app/node_modules/sqlite3/lib/sqlite3.js'), lines.join('\r\n'), 'utf8')

    ilog(`[${new Date().toLocaleString()}] Clean 'node_modules'...`)
    const removeList: string[] = [
      'nan',
      'sqlite3/node_modules',
      'sqlite3/build',
      'sqlite3/deps',
      'sqlite3/src',
      'sqlite3/appveyor.yml',
      'sqlite3/binding.gyp',
      'sqlite3/CHANGELOG.md',
      'sqlite3/CONTRIBUTING.md',
      'sqlite3/electron.sh',
      'sqlite3/README.md'
    ]
    return Promise.all(removeList.map(p => fs.remove(path.join(appPaths[0], 'resources/app/node_modules', p)))).then(() => {
      return { appPaths, newPath }
    })
  })
}).then(({ appPaths, newPath }) => {
  if (fs.existsSync(newPath)) {
    wlog(`[${new Date().toLocaleString()}] Target exists. Overwriting... `)
    fs.removeSync(newPath)
  }
  fs.renameSync(appPaths[0], newPath)
  ilog(`[${new Date().toLocaleString()}] Zip ${newPath}`)
  return zip(newPath, newPath + '.zip')
}).then((size: number) => {
  ilog(`[${new Date().toLocaleString()}] Size: ${size} Bytes`)
}).catch(err => elog(err))
