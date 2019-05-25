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
    path.join(__dirname, '../../asset/icon'),
    path.join(__dirname, '../../asset/chara_title.asar'),
    path.join(__dirname, '../../asset/se.asar'),
    path.join(__dirname, '../../asset/img.asar'),
    path.join(__dirname, '../../asset/font.asar')
  ].map(p => {
    return fs.existsSync(p) ? fs.copy(p, path.join(root, '../asset', path.basename(p))) : void 0
  }))
}

function removeBuild (root: string) {
  const nodeModulesDir = path.join(root, 'node_modules')
  const lameNode = fs.readFileSync(path.join(nodeModulesDir, 'lame/build/Release/bindings.node'))
  const removeList = [
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
    'rijndael-js/test',
    '../package-lock.json'
  ]
  removeList.map(p => {
    const tmpPath = path.join(nodeModulesDir, p)
    if (fs.existsSync(tmpPath)) fs.removeSync(tmpPath)
  })
  fs.mkdirsSync(path.join(nodeModulesDir, 'lame/build/Release'))
  fs.writeFileSync(path.join(nodeModulesDir, 'lame/build/Release/bindings.node'), lameNode)
}

async function packAsar (root: string) {
  await createPackageWithOptions(root, path.join(root, '../app.asar'), { unpack: process.platform === 'linux' ? '{*.node,**/public/*.png}' : '*.node' })
  await fs.remove(root)
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

function createDebInstaller (appPath: string) {
  ilog(`[${new Date().toLocaleString()}] Create .deb installer...`)
  const distRoot = path.dirname(appPath)
  const icon: { [size: string]: string } = {
    '16x16': path.join(__dirname, '../src/res/icon', '16x16.png'),
    '24x24': path.join(__dirname, '../src/res/icon', '24x24.png'),
    '32x32': path.join(__dirname, '../src/res/icon', '32x32.png'),
    '48x48': path.join(__dirname, '../src/res/icon', '48x48.png'),
    '64x64': path.join(__dirname, '../src/res/icon', '64x64.png'),
    '128x128': path.join(__dirname, '../src/res/icon', '128x128.png'),
    '256x256': path.join(__dirname, '../src/res/icon', '256x256.png'),
    '512x512': path.join(__dirname, '../src/res/icon', '512x512.png'),
    '1024x1024': path.join(__dirname, '../src/res/icon', '1024x1024.png')
  }
  fs.mkdirsSync(path.join(distRoot, '.tmp/DEBIAN'))
  fs.writeFileSync(
    path.join(distRoot, '.tmp/DEBIAN/control'),
    `Package: ${pkg.name}
Version: ${pkg.version}-${Math.round(new Date().getTime() / 1000)}
Section: games
Priority: optional
Architecture: ${arch === 'x64' ? 'amd64' : 'i386'}
Depends: kde-cli-tools | kde-runtime | trash-cli | libglib2.0-bin | gvfs-bin, libgconf-2-4, libgtk-3-0 (>= 3.10.0), libnotify4, libnss3 (>= 2:3.26), libxtst6, xdg-utils
Installed-Size: ${getDirectorySizeSync(appPath)}
Maintainer: ${pkg.author.name} <lifenglin314@outlook.com>
Homepage: https://github.com/${pkg.author.name}/${pkg.name}
Description: CGSS Desktop Application
`)

  fs.mkdirsSync(path.join(distRoot, '.tmp/usr/share/applications'))
  fs.writeFileSync(
    path.join(distRoot, `.tmp/usr/share/applications/${pkg.name}.desktop`),
    `[Desktop Entry]
Name=${pkg.name}
Comment=CGSS Desktop Application
GenericName=Game Utility
Exec=/usr/share/${pkg.name}/${pkg.name}
Icon=${pkg.name}
Type=Application
StartupNotify=true
Categories=Utility;Game;
`)

  for (const size in icon) {
    fs.mkdirsSync(path.join(distRoot, `.tmp/usr/share/icons/hicolor/${size}/apps`))
    fs.copySync(icon[size], path.join(distRoot, `.tmp/usr/share/icons/hicolor/${size}/apps/${pkg.name}.png`))
  }
  fs.copySync(appPath, path.join(distRoot, `.tmp/usr/share/${pkg.name}`))

  execSync(`dpkg -b ./.tmp ./${pkg.name}-v${pkg.version}-linux-${arch}.deb`, { cwd: distRoot, stdio: 'inherit' })
  fs.removeSync(path.join(distRoot, '.tmp'))
}

function getDirectorySizeSync (dir: string) {
  const ls = fs.readdirSync(dir)
  let size = 0
  for (let i = 0; i < ls.length; i++) {
    const item = path.join(dir, ls[i])
    const stat = fs.statSync(item)
    if (stat.isDirectory()) {
      size += getDirectorySizeSync(item)
    } else {
      size += stat.size
    }
  }
  return size
}

async function main () {
  const start = new Date().getTime()
  // await reInstall()
  await bundleProductionCode()
  const [appPath] = await packageApp()
  const root = process.platform === 'darwin' ? path.join(appPath, 'mishiro.app/Contents/Resources/app') : path.join(appPath, 'resources/app')
  await writePackageJson(root)

  execSync(`npm install --no-package-lock --production --arch=${arch} --target_arch=${arch} --build-from-source --runtime=electron --target=${pkg.devDependencies.electron} --dist-url=https://atom.io/download/electron`, { cwd: root, stdio: 'inherit' })
  removeBuild(root)
  await packAsar(root)

  await copyExtra(root)
  const newPath = await rename(appPath)
  const size = await zipApp(newPath)
  if (process.platform === 'linux') createDebInstaller(newPath)
  ilog(`[${new Date().toLocaleString()}] Size: ${size} Bytes`)
  return (new Date().getTime() - start) / 1000
}

main().then(s => console.log(`\n  Done in ${s} seconds.`)).catch(e => elog(e))
