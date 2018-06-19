import fs from 'fs-extra'
import path from 'path'
import cache from './native-addons'

Promise.all(cache.map(m => fs.remove(path.join(__dirname, '../node_modules', m)))).catch(e => console.log(e))
