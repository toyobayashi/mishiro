// import { openSqlite } from './sqlite3'
// import { Event } from 'electron'
import DB from '../common/db'

// export default async function (event: Event, objectId: string, scoreFile: string) {
//   let bdb = await openSqlite(scoreFile)
//   let rows = await bdb._all(`SELECT data FROM blobs WHERE name LIKE "%/__.csv" ESCAPE '/'`)
//   bdb.close()
//   if (rows.length === 5) event.sender.send(objectId, true)
//   else event.sender.send(objectId, false)
// }

export default async function getScoreDifficulties (scoreFile: string): Promise<any> {
  const bdb = new DB(scoreFile)
  const rows = await bdb.find('blobs', ['name'], { name: { $like: ['%/__.csv', '/'] } })
  await bdb.close()

  const type = [undefined, 'Debut', 'Regular', 'Pro', 'Master', 'Master+']
  const res: any = {}
  for (let i = 0; i < rows.length; i++) {
    const t: string | undefined = type[Number(rows[i].name.slice(-5)[0])]
    if (t) {
      res[t] = type.indexOf(t).toString()
    }
  }
  return res
}
