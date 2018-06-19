import * as sqlite3 from 'sqlite3'

declare module 'sqlite3' {
  export interface Database {
    _all (sql: string): Promise<any[]>
  }
}

sqlite3.Database.prototype._all = function (sql: string) {
  return new Promise((resolve, reject) => {
    this.all(sql, (err: Error | null, rows: any[]) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

export function openSqlite (db: string, mode = sqlite3.OPEN_READONLY): Promise<sqlite3.Database> {
  return new Promise((resolve, reject) => {
    let d = new sqlite3.Database(db, mode, (err: Error | null) => {
      if (err) reject(err)
      else resolve(d)
    })
  })
}

export default sqlite3
