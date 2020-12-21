import * as electron from 'electron'

const cache = electron.remote.require('./export.js')

// process.once('loaded', function () {
window.preload = {
  configurer: cache.getCache('configurer'),
  client: cache.getCache('client'),
  getPath: cache.getCache('getPath'),
  updater: cache.getCache('updater'),
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
