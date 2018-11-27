import { openSqlite } from './sqlite3'
import * as path from 'path'
import { Event } from 'electron'

function createScore (csv: string, bpm: number) {
  let csvTable: any = csv.split('\n')
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
        if (Number(csvTable[j][4]) === Number(csvTable[i][4])) {
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

export default async function (event: Event, scoreFile: string, difficulty: number | string, bpm: number, src: string) {
  let bdb = await openSqlite(scoreFile)
  let rows = await bdb._all('SELECT name, data FROM blobs')
  bdb.close()
  let name = path.parse(scoreFile).name.split('_')
  let musicscores = name[0]
  let mxxx = name[1]

  let matchedIdArr = name[1].match(/[0-9]+$/)
  let id = matchedIdArr ? Number(matchedIdArr[0]) : void 0

  let nameField = `${musicscores}/${mxxx}/${id}_${difficulty}.csv`

  let data = rows.filter((row: any) => row.name === nameField)[0].data.toString()

  let score = createScore(data, bpm)

  let fullCombo = 0
  for (let i = 0; i < score.length; i++) {
    fullCombo += score[i][2] ? 2 : 1
  }
  let obj = { src, bpm, score, fullCombo }
  event.sender.send('game', obj)
}
