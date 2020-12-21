// import { openSqlite } from './sqlite3'
// import * as path from 'path'
// import { Event } from 'electron'
import { parse } from 'path'
import DB from './db'
// export default async function (event: Event, scoreFile: string) {
//   let bdb = await openSqlite(scoreFile)
//   let rows = await bdb._all('SELECT name, data FROM blobs')
//   bdb.close()
//   let name = path.parse(scoreFile).name.split('_')
//   let musicscores = name[0]
//   let mxxx = name[1]

//   let nameField = `${musicscores}/${mxxx}/${mxxx}_lyrics.csv`
//   let data = rows.filter((row: any) => row.name === nameField)[0].data.toString()
//   const list = data.split('\n')
//   const lyrics = []
//   for (let i = 1; i < list.length - 1; i++) {
//     const line = list[i].split(',')
//     lyrics.push({
//       time: Number(line[0]),
//       lyrics: line[1],
//       size: line[2]
//     })
//   }
//   event.sender.send('lyrics', lyrics)
// }

export interface Lyric {
  time: number
  lyrics: string
  size: number
}

export default async function getLyrics (scoreFile: string): Promise<Lyric[]> {
  const bdb = new DB(scoreFile)
  const rows = await bdb.find<{ name: string, data: Buffer | string }>('blobs', ['name', 'data'])
  await bdb.close()
  const name = parse(scoreFile).name.split('_')
  const musicscores = name[0]
  const mxxx = name[1]

  const nameField = `${musicscores}/${mxxx}/${mxxx}_lyrics.csv`
  const data = rows.filter((row: any) => row.name === nameField)[0].data.toString()
  const list = data.split('\n')
  const lyrics: Lyric[] = []
  for (let i = 1; i < list.length - 1; i++) {
    const line = list[i].split(',')
    lyrics.push({
      time: Number(line[0]),
      lyrics: line[1],
      size: Number(line[2])
    })
  }
  return lyrics
}
