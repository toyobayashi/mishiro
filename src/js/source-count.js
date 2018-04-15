const fs = require('fs')
const path = require('path')

function addOn (arr) {
  let o = {
    files: 0,
    lines: 0
  }
  for (let i = 0; i < arr.length; i++) {
    o.files += arr[i].files
    o.lines += arr[i].lines
  }
  return o
}

function countFile (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err)
        return
      }
      let match = data.match(/\r?\n/g)
      resolve({
        lines: match ? match.length + 1 : 1,
        files: 1
      })
    })
  })
}

function countFolder (folderPath) {
  let task = []
  let list = fs.readdirSync(folderPath)
  for (let i = 0; i < list.length; i++) {
    const el = path.join(folderPath, list[i])
    if (fs.statSync(el).isFile()) task.push(countFile(el))
    else task.push(countFolder(el))
  }
  return Promise.all(task).then(arr => addOn(arr))
}

function count (p) {
  return new Promise((resolve, reject) => {
    fs.stat(p, (err, stats) => {
      if (err) {
        reject(err)
        return
      }
      if (stats.isFile()) resolve(countFile(p))
      else resolve(countFolder(p))
    })
  })
}

function sourceCount (task) {
  let totalTask = []
  let types = Object.keys(task)
  for (let type in task) {
    let typeTask = []
    for (let i = 0; i < task[type].length; i++) {
      typeTask.push(count(task[type][i]))
    }
    totalTask.push(Promise.all(typeTask).then(arr => addOn(arr)))
  }
  return Promise.all(totalTask).then(arr => {
    let o = {}
    for (let i = 0; i < arr.length; i++) {
      o[types[i]] = arr[i]
    }
    o.total = addOn(arr)
    for (let type in o) {
      if (type !== 'total') o[type].percentage = (Math.floor(10000 * o[type].lines / o.total.lines) / 100).toFixed(2) + '%'
    }
    return o
  })
}

module.exports = sourceCount
