import * as packager from 'electron-packager'
import * as path from 'path'
import * as fs from 'fs-extra'
import * as pkg from '../package.json'
import { execSync, spawn } from 'child_process'
import build from './build'
import config from './config'
import chalk from 'chalk'
import { productionPackage, packagerOptions, arch } from './packager.config'
import { getPath } from './util'

const { createPackageWithOptions, extractAll } = require('asar')
const crossZip = require('cross-zip')

function isUuid4 (str: string) {
  const reg = /[0123456789ABCDEF]{8}-[0123456789ABCDEF]{4}-4[0123456789ABCDEF]{3}-[89AB][0123456789ABCDEF]{3}-[0123456789ABCDEF]{12}/
  return reg.test(str)
}

function bundleProductionCode () {
  return build()
}

function packageApp () {
  return packager(packagerOptions)
}

function writePackageJson (root: string) {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(path.join(root, 'package.json'), JSON.stringify(productionPackage), 'utf8', (err) => {
      if (err) return reject(err)
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
    console.log(chalk.yellowBright(`[${new Date().toLocaleString()}] Overwriting ${newPath} `))
    await fs.remove(newPath)
  }
  await fs.rename(appPath, newPath)
  return newPath
}

function zip (source: string, target: string): Promise<number> {
  if (!fs.existsSync(path.dirname(target))) fs.mkdirsSync(path.dirname(target))
  return new Promise<number>((resolve, reject) => {
    crossZip.zip(source, target, (err: Error) => {
      if (err) {
        reject(err)
        return
      }
      fs.stat(target, (err, stat) => {
        if (err) {
          reject(err)
          return
        }
        if (!stat.isFile()) {
          reject(new Error('Zip failed.'))
          return
        }
        resolve(stat.size)
      })
    })
  })
}

function zipApp (p: string) {
  return zip(p, p + '.zip').catch(err => {
    console.log(chalk.yellowBright(`[${new Date().toLocaleString()}] ${err.message} `))
    return -1
  })
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

async function installDependencies (root: string): Promise<void> {
  const libJson = getPath('./.cache', `${process.platform}-${arch}`, 'package.json')
  const libRoot = path.dirname(libJson)

  let needInstall = false
  if (!fs.existsSync(libJson)) {
    fs.mkdirsSync(libRoot)
    fs.writeJsonSync(libJson, pkg)
    needInstall = true
  } else {
    const lib = fs.readJsonSync(libJson) || { devDependencies: {}, dependencies: {} }
    for (let moduleName in pkg.dependencies) {
      if (lib.dependencies[moduleName] !== (pkg.dependencies as any)[moduleName]) {
        fs.writeJsonSync(libJson, pkg)
        needInstall = true
        break
      }
    }
    if (lib.devDependencies.electron !== pkg.devDependencies.electron) {
      needInstall = true
    }
  }

  if (!needInstall) {
    if (!fs.existsSync(path.join(libRoot, 'node_modules.asar'))) {
      needInstall = true
    }
  }

  if (needInstall) {
    if (fs.existsSync(path.join(libRoot, 'node_modules.asar'))) fs.removeSync(path.join(libRoot, 'node_modules.asar'))
    if (fs.existsSync(path.join(libRoot, 'node_modules.asar.unpacked'))) fs.removeSync(path.join(libRoot, 'node_modules.unpacked'))

    execSync(`npm install --no-package-lock --production --arch=${arch} --target_arch=${arch} --build-from-source --runtime=electron --target=${pkg.devDependencies.electron} --dist-url=https://atom.io/download/electron`, { cwd: libRoot, stdio: 'inherit' })
    removeBuild(libRoot)

    await createPackageWithOptions(path.join(libRoot, 'node_modules'), path.join(libRoot, 'node_modules.asar'), {})
    await fs.remove(path.join(libRoot, 'node_modules'))
  }

  extractAll(path.join(libRoot, 'node_modules.asar'), path.join(root, 'node_modules'))
}

function removeBuild (root: string) {
  const nodeModulesDir = path.join(root, 'node_modules')
  const lameNode = fs.readFileSync(path.join(nodeModulesDir, 'lame/build/Release/bindings.node'))
  const removeList = [
    '.bin',
    '.cache',
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

function createDebInstaller (appPath: string) {
  const distRoot = path.dirname(appPath)
  const icon: { [size: string]: string } = {
    '16x16': getPath(config.iconSrcDir, '16x16.png'),
    '24x24': getPath(config.iconSrcDir, '24x24.png'),
    '32x32': getPath(config.iconSrcDir, '32x32.png'),
    '48x48': getPath(config.iconSrcDir, '48x48.png'),
    '64x64': getPath(config.iconSrcDir, '64x64.png'),
    '128x128': getPath(config.iconSrcDir, '128x128.png'),
    '256x256': getPath(config.iconSrcDir, '256x256.png'),
    '512x512': getPath(config.iconSrcDir, '512x512.png'),
    '1024x1024': getPath(config.iconSrcDir, '1024x1024.png')
  }
  fs.mkdirsSync(path.join(distRoot, '.tmp/DEBIAN'))
  fs.chmodSync(path.join(distRoot, '.tmp/DEBIAN'), 0o775)
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

async function asarApp (root: string) {
  await createPackageWithOptions(root, path.join(root, '../app.asar'), { unpack: process.platform === 'linux' ? `{*.node,**/${path.basename(config.outputPath)}/${config.iconOutDir}/*.png}` : '*.node' })
  await fs.remove(root)
}

async function zipAsar (root: string) {
  const resourcePath = path.join(root, '..')
  const tmpDir = path.join(resourcePath, '.tmp')
  fs.mkdirsSync(tmpDir)
  await Promise.all([
    fs.copy(path.join(resourcePath, 'app.asar'), path.join(resourcePath, '.tmp/app.asar')),
    fs.existsSync(path.join(resourcePath, 'app.asar.unpacked')) ? fs.copy(path.join(resourcePath, 'app.asar.unpacked'), path.join(resourcePath, '.tmp/app.asar.unpacked')) : Promise.resolve()
  ])
  try {
    await zip(tmpDir, getPath(config.distPath, `app-v${productionPackage.version}-${process.platform}-${arch}.zip`))
    fs.removeSync(tmpDir)
  } catch (err) {
    console.log(chalk.yellowBright(`[${new Date().toLocaleString()}] ${err.message} `))
  }
}

function inno (sourceDir: string) {
  return new Promise<void>((resolve, reject) => {
    const appid = arch === 'ia32' ? `{{${config.inno.appid.ia32}}` : `{{${config.inno.appid.x64}}`
    if (!isUuid4(appid)) {
      reject(new Error('Please specify [config.inno.appid] in script/config.ts to generate windows installer.'))
      return
    }
    const def: any = {
      Name: pkg.name,
      Version: pkg.version,
      // tslint:disable-next-line: strict-type-predicates
      Publisher: typeof pkg.author === 'object' ? pkg.author.name : pkg.author,
      URL: config.inno.url || pkg.name,
      AppId: appid,
      OutputDir: getPath(config.distPath),
      Arch: arch,
      RepoDir: getPath('..'),
      SourceDir: sourceDir,
      ArchitecturesAllowed: arch === 'ia32' ? '' : 'x64',
      ArchitecturesInstallIn64BitMode: arch === 'ia32' ? '' : 'x64'
    }
    spawn('ISCC.exe', ['/Q', ...Object.keys(def).map(k => `/D${k}=${def[k]}`), getPath('script', `${pkg.name}.iss`)], { stdio: 'inherit' })
      .on('error', reject)
      .on('exit', resolve)
  })
}

export default async function pack () {
  const start = new Date().getTime()

  console.log(chalk.greenBright(`[${new Date().toLocaleString()}] Bundle production code...`))
  await bundleProductionCode()

  process.stdout.write(chalk.greenBright(`[${new Date().toLocaleString()}] `))
  const [appPath] = await packageApp()

  console.log(chalk.greenBright(`[${new Date().toLocaleString()}] Write production package.json...`))
  const root = process.platform === 'darwin' ? path.join(appPath, `${pkg.name}.app/Contents/Resources/app`) : path.join(appPath, 'resources/app')
  await writePackageJson(root)

  console.log(chalk.greenBright(`[${new Date().toLocaleString()}] Install production dependencies...`))
  await installDependencies(root)

  console.log(chalk.greenBright(`[${new Date().toLocaleString()}] Make app.asar...`))
  await asarApp(root)

  console.log(chalk.greenBright(`[${new Date().toLocaleString()}] Copy extra resources...`))
  await copyExtra(root)

  console.log(chalk.greenBright(`[${new Date().toLocaleString()}] Zip resources...`))
  await zipAsar(root)

  const newPath = await rename(appPath)

  console.log(chalk.greenBright(`[${new Date().toLocaleString()}] Zip ${newPath}...`))
  const size = await zipApp(newPath)
  console.log(chalk.greenBright(`[${new Date().toLocaleString()}] Total size of zip: ${size} Bytes`))

  if (process.platform === 'linux') {
    console.log(chalk.greenBright(`[${new Date().toLocaleString()}] Create .deb installer...`))
    createDebInstaller(newPath)
  } else if (process.platform === 'win32') {
    console.log(chalk.greenBright(`[${new Date().toLocaleString()}] Create inno-setup installer...`))
    try {
      await inno(newPath)
    } catch (err) {
      console.log(chalk.yellowBright(`[${new Date().toLocaleString()}] ${err.message} `))
    }
  }

  return (new Date().getTime() - start) / 1000
}

if (require.main === module) {
  pack().then(s => console.log(chalk.greenBright(`\n  Done in ${s} seconds.`))).catch(e => console.log(chalk.redBright(e.toString())))
}
