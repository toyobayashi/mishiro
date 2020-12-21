import * as electron from 'electron'
const ipcRenderer = electron.ipcRenderer

const cache = electron.remote.require('./export.js')

// process.once('loaded', function () {
window.preload = {
  configurer: {
    getAll () { return ipcRenderer.sendSync('configurer#getAll') },
    get<K extends import('../main/config').MishiroConfigKey> (key: K) { return ipcRenderer.sendSync('configurer#get', key) },
    set<K extends import('../main/config').MishiroConfigKey> (key: K | import('../main/config').MishiroConfig, value?: import('../main/config').MishiroConfig[K]) { return ipcRenderer.sendSync('configurer#set', key, value) },
    remove (key: import('../main/config').MishiroConfigKey) { return ipcRenderer.sendSync('configurer#remove', key) }
  },
  getManifestDB () {
    return cache.getCache('manifestDB')
  },
  // getMasterDB () {
  //   return cache.getCache('masterDB')
  // },
  readManifest: cache.getCache('readManifest'),
  // readMaster: cache.getCache('readMaster'),
  // queryManifest: cache.getCache('queryManifest'),
  getLyrics: cache.getCache('getLyrics'),
  getScoreDifficulties: cache.getCache('getScoreDifficulties'),
  getScore: cache.getCache('getScore')
}
window.node = {
  process: process,
  got: __non_webpack_require__('got'),
  electron,
  mishiroCore: __non_webpack_require__('mishiro-core'),
  fs: __non_webpack_require__('fs-extra'),
  os: __non_webpack_require__('os'),
  path: __non_webpack_require__('path'),
  url: __non_webpack_require__('url'),
  childProcess: __non_webpack_require__('child_process')
}
// })
