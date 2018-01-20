const unzip = require('unzip')
const rcedit = require('rcedit')
const request = require('request')
const { slog, log, ilog, elog } = require('cmd-rainbow')
const fs = require('fs')
const path = require('path')
const packageJson = require('./package.json')

const PLATFORM = 'win32'
const ARCH = 'ia32'
const ELECTRON_VERSION = packageJson.devDependencies.electron.slice(1)
const ELECTRON_NAME = `electron-v${ELECTRON_VERSION}-${PLATFORM}-${ARCH}`
const APP_NAME = `${packageJson.name}-v${packageJson.version}-${PLATFORM}-${ARCH}`
const ELECTRON_URL = `https://npm.taobao.org/mirrors/electron/${ELECTRON_VERSION}/${ELECTRON_NAME}.zip`
// const ELECTRON_URL = `https://github.com/electron/electron/releases/download/v${ELECTRON_VERSION}/${ELECTRON_NAME}.zip`
const ELECTRON_RELEASE_DIR = path.join(__dirname, 'dist')
const ELECTRON_RELEASE_PATH = path.join(ELECTRON_RELEASE_DIR, `${ELECTRON_NAME}.zip`)
const DIST_PATH = path.join(__dirname, 'dist', APP_NAME)
const APP_PATH = path.join(DIST_PATH, 'resources', 'app')
const IGNORE_REGEXP = new RegExp(`node_modules|data|release|download|dist|src|screenshot|${path.join('public/img/card').replace(/\\/g, '\\\\')}|${path.join('public/asset/sound/live').replace(/\\/g, '\\\\')}|.gitignore|README.md|webpack|.eslintrc.json|config.json|manifest.json|package-lock.json|pack.js|.git`)

if (!fs.existsSync(ELECTRON_RELEASE_DIR)) fs.mkdirSync(ELECTRON_RELEASE_DIR)

function downloadElectronRelease () {
  const PROGRESS_LENGTH = 30
  if (!fs.existsSync(ELECTRON_RELEASE_PATH)) {
    return new Promise((resolve, reject) => {
      let cur = 0
      let contentLength = 0
      const FILE_SIZE = fs.existsSync(ELECTRON_RELEASE_PATH + '.tmp') ? fs.readFileSync(ELECTRON_RELEASE_PATH + '.tmp').length : 0
      const options = FILE_SIZE ? { url: ELECTRON_URL, headers: { 'Range': 'bytes=' + FILE_SIZE + '-' } } : { url: ELECTRON_URL }
      let req = request(options)
      req.on('response', response => {
        if (response.statusCode !== 200 && response.statusCode !== 304 && response.statusCode !== 206) {
          log(response.statusCode)
          reject(new Error('Request failed.'))
        } else {
          contentLength = Number(response.headers['content-length'])
          let ws = fs.createWriteStream(ELECTRON_RELEASE_PATH + '.tmp', { flags: 'a+' })
          req.on('data', chunk => {
            cur += chunk.length
            let percent = (FILE_SIZE + cur) / (contentLength + FILE_SIZE)
            let l = Math.floor(PROGRESS_LENGTH * percent)
            let progress = `[${repeat('=', l - 1)}>${repeat(' ', PROGRESS_LENGTH - l)}] `
            slog(`Downloading ${ELECTRON_NAME}.zip\n` + progress + (100 * percent).toFixed(2) + '%')
          })
          req.on('error', err => {
            reject(err)
          })
          ws.on('close', () => {
            fs.renameSync(ELECTRON_RELEASE_PATH + '.tmp', ELECTRON_RELEASE_PATH)
            ilog('\ndownload complete.')
            resolve()
          })
          req.pipe(ws)
        }
      })
    })
  } else return Promise.resolve()
  function repeat (char, l) {
    l = l < 0 ? 0 : l
    return Array.from({ length: l }, (v, k) => char).join('')
  }
}

function unzipElectron () {
  return new Promise(resolve => {
    let readStream = fs.createReadStream(ELECTRON_RELEASE_PATH)
    let writeStream = unzip.Extract({ path: DIST_PATH })
    readStream.pipe(writeStream)
    writeStream.on('close', () => {
      resolve(DIST_PATH)
    })
  })
}

function changeExeInfo (exePath, option) {
  return new Promise((resolve, reject) => {
    rcedit(exePath, option, err => {
      if (err) reject(err)
      else resolve('EXE file changed.')
    })
  })
}

function copyFile (oldPath, newPath) {
  return new Promise((resolve, reject) => {
    let rs = fs.createReadStream(oldPath)
    rs.on('error', err => reject(err))
    let ws = fs.createWriteStream(newPath)
    ws.on('error', err => reject(err))
    ws.on('close', () => {
      resolve([oldPath, newPath])
    })
    rs.pipe(ws)
  })
}

function copyFolder (oldPath, newPath, ignore) {
  let task = []
  const files = fs.readdirSync(oldPath)
  if (!fs.existsSync(newPath)) fs.mkdirSync(newPath)
  // if (ignore) files = files.filter(name => !ignore.test(name))
  for (let i = 0; i < files.length; i++) {
    let oldFile = path.join(oldPath, files[i])
    let newFile = path.join(newPath, files[i])
    if (ignore) {
      if (!ignore.test(oldFile)) {
        let stats = fs.statSync(oldFile)
        if (stats.isFile()) {
          task.push(copyFile(oldFile, newFile))
        } else {
          task.push(copyFolder(oldFile, newFile, ignore))
        }
      }
    } else {
      let stats = fs.statSync(oldFile)
      if (stats.isFile()) {
        task.push(copyFile(oldFile, newFile))
      } else {
        task.push(copyFolder(oldFile, newFile, ignore))
      }
    }
  }
  return Promise.all(task)
}

function copy (src, tar, ignore) {
  return new Promise((resolve, reject) => {
    fs.stat(src, (err, stats) => {
      if (err) reject(err)
      else {
        if (stats.isFile()) copyFile(src, tar).then((pathArr) => resolve(pathArr))
        else copyFolder(src, tar, ignore).then((pathArr) => resolve(pathArr))
      }
    })
  })
}

downloadElectronRelease()
  .then(() => unzipElectron())
  .then(() => new Promise((resolve, reject) => {
    fs.unlinkSync(path.join(DIST_PATH, 'resources', 'default_app.asar'))
    fs.rename(path.join(DIST_PATH, 'electron.exe'), path.join(DIST_PATH, `./${packageJson.name}.exe`), err => {
      if (err) reject(err)
      else resolve(path.join(DIST_PATH, `${packageJson.name}.exe`))
    })
  }))
  .then(exePath => changeExeInfo(exePath, {
    icon: path.join(__dirname, './src/res/icon/mishiro.ico'),
    'file-version': packageJson.version,
    'product-version': packageJson.version,
    'version-string': {
      'Block Header': '080404b0',
      FileDescription: packageJson.description,
      InternalName: packageJson.name,
      OriginalFilename: packageJson.name + '.exe',
      ProductName: packageJson.name,
      CompanyName: packageJson.author.name,
      LegalCopyright: 'Copyright (C) 2017 Toyobayashi'
    }
  }))
  .then(msg => {
    ilog(msg)
    return copy(__dirname, APP_PATH, IGNORE_REGEXP)
  })
  .then(pathArr => {
    ilog(`Pack done.`)
  })
  .catch(err => {
    elog(err)
  })
