import * as packager from 'electron-packager'
import * as path from 'path'
import * as fs from 'fs-extra'
import { execSync } from 'child_process'
import * as pkg from '../package.json'
import { prod } from './webpack'
import { ilog, wlog, elog } from './rainbow'
import { zip } from 'zauz'
import { productionPackage, packagerOptions, arch } from './packager.config'

const { createPackageWithOptions } = require('asar')

function bundleProductionCode () {
  ilog(`[${new Date().toLocaleString()}] Bundle production code...`)
  return prod()
}

function packageApp () {
  process.stdout.write(`[${new Date().toLocaleString()}] `)
  return packager(packagerOptions)
}

function writePackageJson (root: string) {
  return fs.writeJson(path.join(root, 'package.json'), productionPackage)
}

function copyExtra (root: string) {
  return Promise.all([
    path.join(__dirname, '../../asset/bgm'),
    path.join(__dirname, '../../asset/icon')
  ].map(p => {
    return fs.existsSync(p) ? fs.copy(p, path.join(root, '../asset', path.basename(p))) : void 0
  }))
}

function removeBuild (root: string) {
  const nodeModulesDir = path.join(root, 'node_modules')
  const lameNode = fs.readFileSync(path.join(nodeModulesDir, 'lame/build/Release/bindings.node'))
  const removeList = [
    '.bin',
    'nan',
    'sqlite3/build',
    'sqlite3/deps',
    'sqlite3/node_modules',
    'sqlite3/src',
    'sqlite3/binding.gyp',
    'sqlite3/CHANGELOG.md',
    'sqlite3/CONTRIBUTING.md',
    'sqlite3/README.md',
    'hca-decoder/build',
    'hca-decoder/binding.gyp',
    'hca-decoder/index.d.ts',
    'hca-decoder/README.md',
    'lame/build',
    'lame/deps',
    'lame/examples',
    'lame/src',
    'lame/test',
    'lame/.npmignore',
    'lame/.travis.yml',
    'lame/.travis.yml',
    'lame/binding.gyp',
    'lame/History.md',
    'lame/README.md',
    '../package-lock.json'
  ]
  removeList.map(p => {
    const tmpPath = path.join(nodeModulesDir, p)
    if (fs.existsSync(tmpPath)) fs.removeSync(tmpPath)
  })
  fs.mkdirsSync(path.join(nodeModulesDir, 'lame/build/Release'))
  fs.writeFileSync(path.join(nodeModulesDir, 'lame/build/Release/bindings.node'), lameNode)
}

function packNodeModules (root: string) {
  return new Promise<void>((resolve) => {
    const nodeModulesDir = path.join(root, 'node_modules')
    createPackageWithOptions(nodeModulesDir, path.join(root, 'node_modules.asar'), { unpack: '*.node' }, () => {
      fs.removeSync(nodeModulesDir)
      resolve()
    })
  })
}

async function rename (appPath: string) {
  let dirName: string | string[] = path.basename(appPath).split('-')
  dirName.splice(1, 0, `v${pkg.version}`)
  dirName = dirName.join('-')
  const newPath = path.join(path.dirname(appPath), dirName)
  if (fs.existsSync(newPath)) {
    wlog(`[${new Date().toLocaleString()}] Overwriting... `)
    await fs.remove(newPath)
  }
  await fs.rename(appPath, newPath)
  return newPath
}

function zipApp (p: string) {
  ilog(`[${new Date().toLocaleString()}] Zip ${p}`)
  return zip(p, p + '.zip')
}

async function main () {
  const start = new Date().getTime()
  // await reInstall()
  await bundleProductionCode()
  const [appPath] = await packageApp()
  const root = process.platform === 'darwin' ? path.join(appPath, 'mishiro.app/Contents/Resources/app') : path.join(appPath, 'resources/app')
  await writePackageJson(root)
  if (process.argv.slice(2)[1] === 'install') {
    execSync(`npm install --production --arch=${arch} --target_arch=${arch} --build-from-source --runtime=electron --target=3.0.0 --dist-url=https://atom.io/download/electron`, { cwd: root, stdio: 'inherit' })
    removeBuild(root)
    await packNodeModules(root)
  }
  await copyExtra(root)
  const newPath = await rename(appPath)
  const size = await zipApp(newPath)
  ilog(`[${new Date().toLocaleString()}] Size: ${size} Bytes`)
  return (new Date().getTime() - start) / 1000
}

main().then(s => console.log(`\n  Done in ${s} seconds.`)).catch(e => elog(e))
