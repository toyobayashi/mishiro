import * as electron from 'electron'

// process.once('loaded', function () {
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
