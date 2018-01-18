import SQL from 'sql.js'

SQL.Database.prototype._exec = function (sql) {
  const resultArray = this.exec(sql)
  let r = []
  for (let i = 0; i < resultArray.length; i++) {
    const result = resultArray[i]
    let newResult = []
    const columns = result.columns.length
    const rows = result.values.length
    for (let j = 0; j < rows; j++) {
      const row = result.values[j]
      let rowObj = {}
      for (let k = 0; k < columns; k++) {
        rowObj[result.columns[k]] = row[k]
      }
      newResult.push(rowObj)
    }
    r.push(newResult)
  }
  if (r.length === 0) {
    return null
  } else if (r.length === 1) {
    return r[0]
  } else {
    return r
  }
}

export default SQL
