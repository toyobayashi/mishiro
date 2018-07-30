import * as fs from 'fs-extra'
import * as path from 'path'
import { ilog } from './rainbow'

const nodeModules = path.join(__dirname, '../node_modules')

function resolveSqlite3 (): Promise<void> {
  const original = path.join(nodeModules, 'sqlite3', 'lib/sqlite3-original.js')
  const script = path.join(nodeModules, 'sqlite3', 'lib/sqlite3.js')

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(original)) {
      fs.renameSync(script, original)
    }
    const sqlite3AddonDir = fs.readdirSync(path.join(nodeModules, 'sqlite3', 'lib/binding'))[0]
    if (fs.existsSync(path.join(nodeModules, 'sqlite3', 'lib/binding', sqlite3AddonDir))) {
      fs.copySync(
        path.join(nodeModules, 'sqlite3', 'lib/binding', sqlite3AddonDir, 'node_sqlite3.node'),
        path.join(nodeModules, 'sqlite3', 'lib/binding', sqlite3AddonDir, 'sqlite3.node')
      )
      const lines = fs.readFileSync(original, 'utf8').split(/\r?\n/)
      lines[3] = `var binding = require('./binding/${sqlite3AddonDir}/sqlite3.node');`
      lines.splice(0, 1)
      lines.splice(1, 1)
      fs.writeFile(script, lines.join('\r\n'), 'utf8', err => {
        if (!err) resolve()
        else reject(err)
      })
    } else reject(new Error('sqlite3 compiled failed.'))
  })
}

function resolveLame (): Promise<void> {
  const original = path.join(nodeModules, 'lame', 'lib/bindings-original.js')
  const script = path.join(nodeModules, 'lame', 'lib/bindings.js')

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(original)) {
      fs.renameSync(script, original)
    }
    const lameAddon = path.join(nodeModules, 'lame', 'build/Release/bindings.node')
    if (fs.existsSync(lameAddon)) {
      fs.copySync(lameAddon, path.join(path.dirname(lameAddon), 'lame.node'))
      const lines = fs.readFileSync(original, 'utf8').split(/\r?\n/)
      lines[0] = 'module.exports = require("../build/Release/lame.node");'
      fs.writeFile(script, lines.join('\r\n'), 'utf8', err => {
        if (!err) resolve()
        else reject(err)
      })
    } else reject(new Error('lame compiled failed.'))
  })
}

function resolveHcaDecoder (): Promise<void> {
  const original = path.join(nodeModules, 'hca-decoder', 'index-original.js')
  const script = path.join(nodeModules, 'hca-decoder', 'index.js')

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(original)) {
      fs.renameSync(script, original)
    }
    const hcaAddon = path.join(nodeModules, 'hca-decoder', 'dist/hca.node')
    if (fs.existsSync(hcaAddon)) {
      fs.copySync(hcaAddon, path.join(path.dirname(hcaAddon), 'hca-decoder.node'))
      const lines = fs.readFileSync(original, 'utf8').split(/\r?\n/)
      lines[0] = 'module.exports = require("./dist/hca-decoder.node");'
      fs.writeFile(script, lines.join('\r\n'), 'utf8', err => {
        if (!err) resolve()
        else reject(err)
      })
    } else reject(new Error('hca-decoder compiled failed.'))
  })
}

Promise.all([resolveSqlite3(), resolveLame(), resolveHcaDecoder()]).then(() => ilog('after-npm-install done.'))
