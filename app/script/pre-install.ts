import fs from 'fs-extra'
import path from 'path'

const cache = ['hca-decoder', 'sqlite3', 'lame']

Promise.all(cache.map(m => fs.remove(path.join(__dirname, '../node_modules', m)))).catch(e => console.log(e))
