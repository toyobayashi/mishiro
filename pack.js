const unzip = require('unzip')
const rcedit = require('rcedit')
const request = require('request')
const { slog, log, ilog, elog, wlog } = require('cmd-rainbow')
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
downloadElectronRelease()
  .then(() => {
    if (fs.existsSync(DIST_PATH)) {
      wlog(`[WARNING ${t()}] ${DIST_PATH} exists.`)
      return remove(DIST_PATH)
    }
    return []
  })
  .then(() => unzipElectron())
  .then(() => new Promise((resolve, reject) => {
    fs.unlinkSync(path.join(DIST_PATH, 'resources', 'default_app.asar'))
    fs.rename(path.join(DIST_PATH, 'electron.exe'), path.join(DIST_PATH, `./${packageJson.name}.exe`), err => {
      if (err) reject(err)
      else resolve()
    })
  }))
  .then(() => changeExeInfo(path.join(DIST_PATH, `${packageJson.name}.exe`), {
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
  .then(() => {
    ilog(`[INFO ${t()}] EXE file changed.`)
    return copy(__dirname, APP_PATH, IGNORE_REGEXP)
  })
  .then(pathArr => {
    ilog(`[INFO ${t()}] Pack done.`)
  })
  .catch(err => {
    elog(`[ERROR ${t()}] ${err}`)
  })

function downloadElectronRelease () {
  const PROGRESS_LENGTH = 30
  if (!fs.existsSync(ELECTRON_RELEASE_PATH)) {
    return new Promise((resolve, reject) => {
      let cur = 0
      const FILE_SIZE = fs.existsSync(ELECTRON_RELEASE_PATH + '.tmp') ? fs.readFileSync(ELECTRON_RELEASE_PATH + '.tmp').length : 0
      let options = FILE_SIZE ? { url: ELECTRON_URL, headers: { 'Range': 'bytes=' + FILE_SIZE + '-' } } : { url: ELECTRON_URL }
      let req = request(options)
      req.on('response', response => {
        if (response.statusCode !== 200 && response.statusCode !== 304 && response.statusCode !== 206) {
          log(response.statusCode)
          req.abort()
          reject(new Error('Request failed.'))
        } else {
          ilog(`[INFO ${t()}] Downloading ${ELECTRON_NAME}.zip`)
          const CONTENT_LENGTH = Number(response.headers['content-length'])
          let ws = fs.createWriteStream(ELECTRON_RELEASE_PATH + '.tmp', { flags: 'a+' })
          req.on('data', chunk => {
            cur += chunk.length
            const PERCENT = (FILE_SIZE + cur) / (CONTENT_LENGTH + FILE_SIZE)
            const COMPLETED_LENGTH = Math.floor(PROGRESS_LENGTH * PERCENT)
            const PROGRESS_BAR = `[${repeat('=', COMPLETED_LENGTH - 1)}>${repeat(' ', PROGRESS_LENGTH - COMPLETED_LENGTH)}] `
            slog(PROGRESS_BAR + (100 * PERCENT).toFixed(2) + '%')
          })
          req.on('error', err => {
            reject(err)
          })
          ws.on('close', () => {
            fs.renameSync(ELECTRON_RELEASE_PATH + '.tmp', ELECTRON_RELEASE_PATH)
            ilog(`\n[INFO ${t()}] Download completed.`)
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
      else resolve()
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
