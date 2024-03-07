import * as fs from 'fs-extra'
import * as path from 'path'

const nativeModules = ['hca-decoder', 'sqlite3', 'mishiro-core', '@vscode/spdlog', 'usm-decrypter']

Promise.all(nativeModules.map(m => fs.remove(path.join(__dirname, '../node_modules', m)))).catch(e => console.log(e))
