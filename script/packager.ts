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
    ilog(`[${new Date().toLocaleString()}] Installing C++ native module...`)
    return execAsync(
      `npm install ${cache.join(' ')} --no-save --target_arch=${arch} --arch=${arch}`,
      { cwd: path.join(appPaths[0], './resources/app') }
    ).then(() => {
      let removeList: string[] = ['../.npmrc', 'bindings']

      if (fs.existsSync(path.join(appPaths[0], './resources/app/node_modules', 'sqlite3'))) {
        const sqlite3AddonDir = fs.readdirSync(path.join(appPaths[0], './resources/app/node_modules/sqlite3/lib/binding'))[0]
        const lines = fs.readFileSync(path.join(appPaths[0], './resources/app/node_modules/sqlite3/lib/sqlite3.js'), 'utf8').split(/\r?\n/)
        lines[3] = `var binding = require('./binding/${sqlite3AddonDir}/node_sqlite3.node');`
        lines.splice(0, 1)
        lines.splice(1, 1)
        fs.writeFileSync(path.join(appPaths[0], './resources/app/node_modules/sqlite3/lib/sqlite3.js'), lines.join('\r\n'), 'utf8')

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
      } else {
        elog(`[${new Date().toLocaleString()}] Module 'sqlite3' installing failed.`)
        process.exit(0)
      }

      if (fs.existsSync(path.join(appPaths[0], './resources/app/node_modules', 'hca-decoder'))) {
        removeList = [...removeList, ...[
          'hca-decoder/src',
          'hca-decoder/build',
          'hca-decoder/binding.gyp',
          'hca-decoder/index.d.ts',
          'hca-decoder/README.md'
        ]]
      } else {
        elog(`[${new Date().toLocaleString()}] Module 'hca-decoder' installing failed.`)
        process.exit(0)
      }

      if (fs.existsSync(path.join(appPaths[0], './resources/app/node_modules', 'lame'))) {
        fs.copyFileSync(
          path.join(appPaths[0], './resources/app/node_modules/lame', './build/Release/bindings.node'),
          path.join(appPaths[0], './resources/app/node_modules/lame', './lib/lame.node')
        )
        const lines = fs.readFileSync(path.join(appPaths[0], './resources/app/node_modules/lame/lib/bindings.js'), 'utf8').split(/\r?\n/)
        lines[0] = 'module.exports = require("./lame.node");'
        fs.writeFileSync(path.join(appPaths[0], './resources/app/node_modules/lame/lib/bindings.js'), lines.join('\r\n'), 'utf8')
        removeList = [...removeList, ...[
          'lame/src',
          'lame/build',
          'lame/binding.gyp',
          'lame/README.md',
          'lame/deps',
          'lame/examples',
          'lame/test',
          'lame/.npmignore',
          'lame/.travis.yml',
          'lame/History.md'
        ]]
      } else {
        elog(`[${new Date().toLocaleString()}] Module 'lame' installing failed.`)
        process.exit(0)
      }

      return Promise.all(removeList.map(p => fs.remove(path.join(appPaths[0], 'resources/app/node_modules', p))))
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
  }).then(() => {
    console.log(`\n  Done in ${(new Date().getTime() - start) / 1000} seconds.`)
  })
}).catch(err => elog(err))
