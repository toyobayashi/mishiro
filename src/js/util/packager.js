const unzip = require('unzip')
const rcedit = require('rcedit')
const request = require('request')
const fs = require('fs')
const path = require('path')
const { slog, log, ilog, wlog, elog } = require('./rainbow.js')
const packageJson = require('../../../package.json')

function downloadElectronRelease (electronUrl, electronPath) {
  const PROGRESS_LENGTH = 50
  if (!fs.existsSync(electronPath)) {
    return new Promise((resolve, reject) => {
      let cur = 0
      const FILE_SIZE = fs.existsSync(electronPath + '.tmp') ? fs.readFileSync(electronPath + '.tmp').length : 0
      let options = FILE_SIZE ? { url: electronUrl, headers: { 'Range': 'bytes=' + FILE_SIZE + '-' } } : { url: electronUrl }
      let req = request(options)
      req.on('response', response => {
        if (response.statusCode !== 200 && response.statusCode !== 304 && response.statusCode !== 206) {
          log(response.statusCode)
          req.abort()
          reject(new Error('Request failed.'))
        } else {
          ilog(`[INFO ${t()}] Downloading ${path.parse(electronPath).base}`)
          const CONTENT_LENGTH = Number(response.headers['content-length'])
          let ws = fs.createWriteStream(electronPath + '.tmp', { flags: 'a+' })
          req.on('data', chunk => {
            cur += chunk.length
            const PERCENT = (FILE_SIZE + cur) / (CONTENT_LENGTH + FILE_SIZE)
            const COMPLETED_LENGTH = Math.floor(PROGRESS_LENGTH * PERCENT)
            const PROGRESS_BAR = `[${repeat('=', COMPLETED_LENGTH - 1)}>${repeat(' ', PROGRESS_LENGTH - COMPLETED_LENGTH)}] `
            slog(PROGRESS_BAR + (100 * PERCENT).toFixed(2) + '%')
          })
          ws.on('close', () => {
            fs.renameSync(electronPath + '.tmp', electronPath)
            ilog(`\n[INFO ${t()}] Download completed.`)
            resolve()
          })
          req.pipe(ws)
        }
      }).on('error', err => reject(err))
    })
  } else return Promise.resolve()
  function repeat (char, l) {
    l = l < 0 ? 0 : l
    return Array.from({ length: l }, (v, k) => char).join('')
  }
}

function unzipElectron (electronPath, distPath) {
  return new Promise(resolve => {
    let readStream = fs.createReadStream(electronPath)
    let writeStream = unzip.Extract({ path: distPath })
    readStream.pipe(writeStream)
    writeStream.on('close', () => {
      resolve(distPath)
    })
  })
}

function changeExeInfo (exePath, option) {
  return new Promise((resolve, reject) => {
    rcedit(exePath, option, err => {
      if (err) reject(err)
      else resolve(true)
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
  for (let i = 0; i < files.length; i++) {
    let oldFile = path.join(oldPath, files[i])
    let newFile = path.join(newPath, files[i])
    if (ignore) {
      if (!ignore.test(oldFile)) {
        task.push(fs.statSync(oldFile).isFile() ? copyFile(oldFile, newFile) : copyFolder(oldFile, newFile, ignore))
      }
    } else {
      task.push(fs.statSync(oldFile).isFile() ? copyFile(oldFile, newFile) : copyFolder(oldFile, newFile))
    }
  }
  return task.length ? Promise.all(task) : Promise.resolve([])
}

function removeFile (filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, err => {
      if (err) reject(err)
      else resolve(filePath)
    })
  })
}

function removeFolder (folderPath) {
  let task = []
  const files = fs.readdirSync(folderPath)
  if (files.length) {
    for (let i = 0; i < files.length; i++) {
      let file = path.join(folderPath, files[i])
      task.push(fs.statSync(file).isFile() ? removeFile(file) : removeFolder(file))
    }
    return Promise.all(task).then((arr) => {
      fs.rmdirSync(folderPath)
      return arr
    })
  } else {
    fs.rmdirSync(folderPath)
    return Promise.resolve([])
  }
}

function copy (src, tar, ignore) {
  return new Promise((resolve, reject) => {
    fs.stat(src, (err, stats) => {
      if (err) reject(err)
      else {
        if (stats.isFile()) resolve(copyFile(src, tar))
        else resolve(copyFolder(src, tar, ignore))
      }
    })
  })
}

function remove (src) {
  return new Promise((resolve, reject) => {
    fs.stat(src, (err, stats) => {
      if (err) reject(err)
      else {
        if (stats.isFile()) resolve(removeFile(src))
        else resolve(removeFolder(src))
      }
    })
  })
}

function t () {
  return new Date().toLocaleString()
}

module.exports = function pack (option) {
  const PLATFORM = option.platform ? option.platform : 'win32'
  const ARCH = option.arch ? option.arch : 'ia32'
  const ELECTRON_VERSION = option.electronVersion ? option.electronVersion : packageJson.devDependencies.electron.slice(1)
  const DIST_DIR = option.distDir ? option.distDir : path.join(__dirname, '../../../dist')
  const IGNORE_REGEXP = option.ignore
  const VERSION_STRING = option.versionString

  const ELECTRON_NAME = `electron-v${ELECTRON_VERSION}-${PLATFORM}-${ARCH}`
  const ELECTRON_URL = `https://npm.taobao.org/mirrors/electron/${ELECTRON_VERSION}/${ELECTRON_NAME}.zip`
  // const ELECTRON_URL = `https://github.com/electron/electron/releases/download/v${ELECTRON_VERSION}/${ELECTRON_NAME}.zip`
  const APP_NAME = `${packageJson.name}-v${packageJson.version}-${PLATFORM}-${ARCH}`
  const ELECTRON_PATH = path.join(DIST_DIR, `${ELECTRON_NAME}.zip`)
  const DIST_PATH = path.join(DIST_DIR, APP_NAME)
  const APP_PATH = path.join(DIST_PATH, 'resources', 'app')

  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR)
  downloadElectronRelease(ELECTRON_URL, ELECTRON_PATH)
    .then(() => {
      if (fs.existsSync(DIST_PATH)) {
        wlog(`[WARNING ${t()}] ${DIST_PATH} exists.`)
        return remove(DIST_PATH)
      }
      return []
    })
    .then(() => unzipElectron(ELECTRON_PATH, DIST_PATH))
    .then(() => new Promise((resolve, reject) => {
      fs.unlinkSync(path.join(DIST_PATH, 'resources', 'default_app.asar'))
      fs.rename(path.join(DIST_PATH, 'electron.exe'), path.join(DIST_PATH, `${packageJson.name}.exe`), err => {
        if (err) reject(err)
        else resolve()
      })
    }))
    .then(() => {
      if (VERSION_STRING) return changeExeInfo(path.join(DIST_PATH, `${packageJson.name}.exe`), VERSION_STRING)
      else return false
    })
    .then((isChanged) => {
      if (isChanged) ilog(`[INFO ${t()}] EXE file changed.`)
      return copy(path.join(__dirname, '../../..'), APP_PATH, IGNORE_REGEXP)
    })
    .then(pathArr => {
      ilog(`[INFO ${t()}] Pack done.`)
    })
    .catch(err => {
      elog(`[ERROR ${t()}] ${err}`)
    })
}
