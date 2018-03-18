import sqlite3 from './node-module-sqlite3.js'
import path from 'path'
import createScore from './score.js'

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
  let obj = { src, bpm, score }
  event.sender.send('game', obj)
}
