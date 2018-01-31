const fs = require('fs')
const path = require('path')

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

function read (file, option) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, option, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

function write (file, data, option) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, option, (err) => {
      if (err) reject(err)
      else resolve(file)
    })
  })
}

module.exports = { copy, remove, read, write }
