import { openSqlite } from './sqlite3'
import { Event } from 'electron'

export default async function (event: Event, objectId: string, scoreFile: string) {
  let bdb = await openSqlite(scoreFile)
  let rows = await bdb._all(`SELECT data FROM blobs WHERE name LIKE "%/__.csv" ESCAPE '/'`)
  bdb.close()
  if (rows.length === 5) event.sender.send(objectId, true)
  else event.sender.send(objectId, false)
}
