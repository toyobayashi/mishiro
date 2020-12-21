import * as electron from 'electron'

const cache = electron.remote.require('./export.js')

// process.once('loaded', function () {
window.preload = {
  getManifestDB () {
    return cache.getCache('manifestDB')
  },
  readManifest: cache.getCache('readManifest')
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
