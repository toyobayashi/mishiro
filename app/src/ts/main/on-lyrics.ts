import { openSqlite } from './sqlite3'
import * as path from 'path'
import { Event } from 'electron'

export default async function (event: Event, scoreFile: string) {
  let bdb = await openSqlite(scoreFile)
  let rows = await bdb._all('SELECT name, data FROM blobs')
  bdb.close()
  let name = path.parse(scoreFile).name.split('_')
  let musicscores = name[0]
  let mxxx = name[1]

  let nameField = `${musicscores}/${mxxx}/${mxxx}_lyrics.csv`
  let data = rows.filter((row: any) => row.name === nameField)[0].data.toString()
  const list = data.split('\n')
  const lyrics = []
  for (let i = 1; i < list.length - 1; i++) {
    const line = list[i].split(',')
    lyrics.push({
      time: Number(line[0]),
      lyrics: line[1],
      size: line[2]
    })
  }
  event.sender.send('lyrics', lyrics)
}
