import { sqlite3 } from '*sqlite3'

const sql3: sqlite3 = __non_webpack_require__('sqlite3')

sql3.Database.prototype._all = function (sql: string) {
  return new Promise((resolve, reject) => {
    this.all(sql, (err: Error | null, rows: any[]) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

sql3.openAsync = function (db: string, mode = sql3.OPEN_READONLY) {
  return new Promise((resolve, reject) => {
    let d = new sql3.Database(db, mode, (err: Error | null) => {
      if (err) reject(err)
      else resolve(d)
    })
  })
}

export default sql3
