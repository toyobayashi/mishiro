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

const start = new Date().getTime()
Promise.resolve().then(() => {
  if (cache.hca.exist) return
  ilog(`[${new Date().toLocaleString()}] Rebuild hca...`)
  return execAsync(`npm run hca --arch=${arch}`, { cwd: path.join(__dirname, '..') }).then(() => {
    ilog(`[${new Date().toLocaleString()}] Cache hca...`)
    return fs.copy(path.join(__dirname, '../build/Release/hca.node'), path.join(cache.hca.path, 'hca.node'))
  })
}).then(() => {
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
    if (!cache.hca.exist) return
    ilog(`[${new Date().toLocaleString()}] Copy hca...`)
    return fs.copy(path.join(cache.hca.path, 'hca.node'), path.join(appPaths[0], './resources/app/public/addon/hca.node'))
  }).then(() => {
    if (!cache.sqlite3.exist) {
      ilog(`[${new Date().toLocaleString()}] Installing sqlite3...`)
      return execAsync(
        `npm install sqlite3 --no-save --build-from-source --runtime=electron --target=${pkg.devDependencies.electron.replace(/\^|~/, '')} --target_arch=${arch} --dist-url=https://atom.io/download/electron`,
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
          ilog(`[${new Date().toLocaleString()}] Cache sqlite3...`)
          return fs.copy(path.join(appPaths[0], './resources/app/node_modules/sqlite3'), cache.sqlite3.path)
        })
      })
    }
    ilog(`[${new Date().toLocaleString()}] Copy sqlite3...`)
    return fs.copy(path.join(cache.sqlite3.path), path.join(appPaths[0], './resources/app/node_modules/sqlite3'))
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
