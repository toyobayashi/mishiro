import sqlite3 from './node-module-sqlite3.js'
import path from 'path'

function createScore (csv, bpm) {
  let csvTable = csv.split('\n')
  for (let i = 0; i < csvTable.length; i++) {
    csvTable[i] = csvTable[i].split(',')
    csvTable[i][1] = Math.round(csvTable[i][1] / (60 / bpm) * 1000) / 1000
    if (i > 0) {
      csvTable[i][2] = Number(csvTable[i][2])
      if (csvTable[i][2] !== 1 && csvTable[i][2] !== 2) {
        csvTable.splice(i, 1)
        i--
      }
    }
  }

  let score = []
  for (let i = 1; i < csvTable.length; i++) {
    let note = [csvTable[i][1], Number(csvTable[i][4])]
    if (csvTable[i][2] === 2) {
      let j = i + 1
      for (j = i + 1; j < csvTable.length; j++) {
        if (csvTable[j][4] == csvTable[i][4]) {
          let length = csvTable[j][1] - csvTable[i][1]
          note.push(length)
          csvTable.splice(j, 1)
          score.push(note)
          break
        }
      }
    } else {
      score.push(note)
    }
  }

  return score
}

export default async function (event, scoreFile, difficulty, bpm, src) {
  let bdb = await sqlite3.openAsync(scoreFile)
  let rows = await bdb._all('SELECT name, data FROM blobs')
  let name = path.parse(scoreFile).name.split('_')
  let musicscores = name[0]
  let mxxx = name[1]

  let id = Number(name[1].match(/[0-9]+$/)[0])

  let nameField = `${musicscores}/${mxxx}/${id}_${difficulty}.csv`

  let data = rows.filter(row => row.name === nameField)[0].data.toString()

  let score = createScore(data, bpm)

  let fullCombo = 0
  for (let i = 0; i < score.length; i++) {
    fullCombo += score[i][2] ? 2 : 1
  }
  let obj = { src, bpm, score, fullCombo }
  event.sender.send('game', obj)
}
