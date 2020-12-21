import * as sqlite3 from 'sqlite3'

class DB {
  private _db: sqlite3.Database | null = null

  public static async open (dbPath: string, mode: number = sqlite3.OPEN_READONLY): Promise<DB> {
    return new Promise<DB>((resolve, reject) => {
      let db: sqlite3.Database | null = new sqlite3.Database(dbPath, mode, (err: Error | null) => {
        if (err) {
          reject(err)
          db = null
        } else {
          const _db = new DB(dbPath)
          _db._db = db
          resolve(_db)
        }
      })
    })
  }

  constructor (private readonly _dbPath: string) {
    this._db = new sqlite3.Database(this._dbPath, sqlite3.OPEN_READONLY, (err: Error | null) => {
      if (err) {
        console.log(err)
        this._db = null
      }
    })
  }

  query<T = any> (sql: string): Promise<T[]> {
    if (!this._db) return Promise.reject(new Error(`Database ${this._dbPath} is not available.`))
    return new Promise<T[]>((resolve, reject) => {
      if (!this._db) {
        reject(new Error(`Database ${this._dbPath} is not available.`))
        return
      }
      this._db.all(sql, (err: Error | null, rows: T[]) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  findEach<T = any> (table: string, columns?: string[], query?: { [column: string]: any }, orderBy?: { [column: string]: 1 | -1 }, eachCall?: (this: sqlite3.Statement, err: Error | null, row: T) => void): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      if (!this._db) {
        reject(new Error(`Database ${this._dbPath} is not available.`))
        return
      }

      const res: T[] = []

      this._db.each(DB.toSQL(table, columns, query, orderBy), function (err: Error | null, row: T) {
        if (err) {
          reject(err)
          return
        }
        if (eachCall) eachCall.call(this, err, row)
        res.push(row)
      }, (err /* , count: number */) => {
        if (err) {
          reject(err)
          return
        }
        resolve(res)
      })
    })
  }

  findOne<T = any> (table: string, columns?: string[], query?: { [column: string]: any }, orderBy?: { [column: string]: 1 | -1 }): Promise<T | undefined> {
    return new Promise<T>((resolve, reject) => {
      if (!this._db) {
        reject(new Error(`Database ${this._dbPath} is not available.`))
        return
      }
      this._db.get(DB.toSQL(table, columns, query, orderBy), (err: Error | null, row: T) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  find<T = any> (table: string, columns?: string[], query?: { [column: string]: any }, orderBy?: { [column: string]: 1 | -1 }): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      if (!this._db) {
        reject(new Error(`Database ${this._dbPath} is not available.`))
        return
      }
      this._db.all(DB.toSQL(table, columns, query, orderBy), (err: Error | null, rows: T[]) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  close (): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this._db) {
        reject(new Error(`Database ${this._dbPath} is not available.`))
        return
      }
      this._db.close(err => {
        if (err) {
          reject(err)
          return
        }
        this._db = null
        resolve()
      })
    })
  }

  public static toSQL (table: string, columns?: string[], query?: { [column: string]: any }, orderBy?: { [column: string]: 1 | -1 }): string {
    let sql = `SELECT ${columns ? columns.join(', ') : '*'} FROM ${table}`
    if (query) {
      sql += ' WHERE '
      const conditionArray = []
      for (const column in query) {
        if (typeof query[column] === 'object' && query[column] !== null) {
          if (column === '$or') {
            throw new Error('$or is not supported yet.')
          } else {
            for (const con in query[column]) {
              if (con === '$gt') {
                conditionArray.push(`${column} > ${query[column][con]}`)
              } else if (con === '$gte') {
                conditionArray.push(`${column} >= ${query[column][con]}`)
              } else if (con === '$lt') {
                conditionArray.push(`${column} < ${query[column][con]}`)
              } else if (con === '$lte') {
                conditionArray.push(`${column} <= ${query[column][con]}`)
              } else if (con === '$ne') {
                conditionArray.push(`${column} != ${query[column][con]}`)
              } else if (con === '$like') {
                if (typeof query[column][con] === 'string') {
                  conditionArray.push(`${column} LIKE "${query[column][con]}"`)
                } else if (Array.isArray(query[column][con])) {
                  conditionArray.push(`${column} LIKE "${query[column][con][0]}" ESCAPE '${query[column][con][1]}'`)
                }
              } else if (con === '$in') {
                conditionArray.push(`${column} IN (${query[column][con].map((v: string) => ('"' + v + '"')).join(',')})`)
              }
            }
          }
        } else {
          conditionArray.push(`${column} = ${typeof query[column] === 'number' ? query[column] : `"${query[column]}"`}`)
        }
      }
      sql += conditionArray.join(' AND ')
    }

    if (orderBy) {
      sql += ' ORDER BY '
      const orderByArray = []
      for (const column in orderBy) {
        if (orderBy[column] === 1) {
          orderByArray.push(`${column} ASC`)
        } else if (orderBy[column] === -1) {
          orderByArray.push(`${column} DESC`)
        }
      }
      sql += orderByArray.join(', ')
    }

    return sql
  }
}

export default DB
