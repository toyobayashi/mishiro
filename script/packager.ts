import packager from 'electron-packager'
import path from 'path'
import fs from 'fs-extra'
import { exec, ExecOptions } from 'child_process'
import pkg from '../package.json'
import { prod } from './webpack'
import { ilog, wlog, elog } from './rainbow'
import { zip } from 'zauz'
import { arch, cache, productionPackage, packagerOptions } from './packager.config'

const execAsync = (cmd: string, options?: ExecOptions) => {
  return new Promise((resolve, reject) => {
    exec(cmd, options, (err, _stdout) => {
      if (!err) resolve()
      else reject(err)
    })
  }) as Promise<void>
}

function installCppDependencies (installList: string[], appPath: string) {
  if (installList.length) {
    ilog(`[${new Date().toLocaleString()}] Installing C++ native module...`)
    return execAsync(
      `npm install ${installList.join(' ')} --no-save --target_arch=${arch} --arch=${arch}`,
      { cwd: path.join(appPath, './resources/app') }
    ).then(() => {
      let removeList: string[] = ['../.npmrc']
      if (installList.indexOf('sqlite3') !== -1) {
        ilog(`[${new Date().toLocaleString()}] Resolving 'sqlite3' production code...`)
        const sqlite3AddonDir = fs.readdirSync(path.join(appPath, './resources/app/node_modules/sqlite3/lib/binding'))[0]
        const lines = fs.readFileSync(path.join(appPath, './resources/app/node_modules/sqlite3/lib/sqlite3.js'), 'utf8').split(/\r?\n/)
        lines[3] = `var binding = require('./binding/${sqlite3AddonDir}/node_sqlite3.node');`
        lines.splice(0, 1)
        lines.splice(1, 1)
        fs.writeFileSync(path.join(appPath, './resources/app/node_modules/sqlite3/lib/sqlite3.js'), lines.join('\r\n'), 'utf8')

        removeList = [...removeList, ...[
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
        ]]
      }
      if (installList.indexOf('hca-decoder') !== -1) {
        ilog(`[${new Date().toLocaleString()}] Resolving 'hca-decoder' production code...`)
        removeList = [...removeList, ...[
          'hca-decoder/src',
          'hca-decoder/build',
          'hca-decoder/binding.gyp',
          'hca-decoder/README.md'
        ]]
      }
      return Promise.all(removeList.map(p => fs.remove(path.join(appPath, 'resources/app/node_modules', p)))).then(() => {
        ilog(`[${new Date().toLocaleString()}] Cache C++ native module...`)
        return Promise.all(
          installList.map(
            moduleName => fs.copy(path.join(appPath, './resources/app/node_modules', moduleName), cache[moduleName].path)
          )
        )
      })
    })
  }
  return Promise.all([fs.remove(path.join(appPath, 'resources/app/node_modules', '../.npmrc'))])
}

const start = new Date().getTime()
Promise.resolve().then(() => {
  ilog(`[${new Date().toLocaleString()}] Bundle production code...`)
  return prod(() => process.stdout.write(`[${new Date().toLocaleString()}] `))
}).then(() => {
  return packager(packagerOptions)
}).then(appPaths => {
  let dirName: string | string[] = path.basename(appPaths[0]).split('-')
  dirName.splice(1, 0, `v${pkg.version}`)
  dirName = dirName.join('-')
  const newPath = path.join(path.dirname(appPaths[0]), dirName)

  ilog(`[${new Date().toLocaleString()}] Write package.json...`)
  return fs.writeFile(path.join(appPaths[0], './resources/app', 'package.json'), JSON.stringify(productionPackage), 'utf8').then(() => {
    const installList: string[] = []
    const cacheList: string[] = []
    // const promiseArr: PromiseLike<any>[] = []
    for (const moduleName in cache) {
      if (!cache[moduleName].exist) installList.push(moduleName)
      else cacheList.push(moduleName)
    }
    return installCppDependencies(installList, appPaths[0]).then(() => {
      if (cacheList.length) {
        ilog(`[${new Date().toLocaleString()}] Copy Modules...`)
        return Promise.all(
          cacheList.map(
            moduleName => fs.copy(cache[moduleName].path, path.join(appPaths[0], './resources/app/node_modules', moduleName))
          )
        )
      }
      return []
    })
  }).then(() => {
    if (!fs.existsSync(newPath)) return
    wlog(`[${new Date().toLocaleString()}] Overwriting... `)
    return fs.remove(newPath)
  }).then(() => {
    return fs.rename(appPaths[0], newPath)
  }).then(() => {
    ilog(`[${new Date().toLocaleString()}] Zip ${newPath}`)
    return zip(newPath, newPath + '.zip')
  }).then((size: number) => {
    ilog(`[${new Date().toLocaleString()}] Size: ${size} Bytes`)
    console.log(`\n  Done in ${(new Date().getTime() - start) / 1000} seconds.`)
  })
}).catch(err => elog(err))
