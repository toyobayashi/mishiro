import * as electron from 'electron'

// process.once('loaded', function () {
window.node = {
  process: process,
  electron,
  tybys: {
    downloader: __non_webpack_require__('@tybys/downloader')
  },
  mishiroCore: __non_webpack_require__('mishiro-core'),
  fs: __non_webpack_require__('fs-extra'),
  events: __non_webpack_require__('events'),
  acb: __non_webpack_require__('acb'),
  hcaDecoder: __non_webpack_require__('hca-decoder'),
  os: __non_webpack_require__('os'),
  path: __non_webpack_require__('path'),
  url: __non_webpack_require__('url'),
  childProcess: __non_webpack_require__('child_process'),
  iconvLite: __non_webpack_require__('iconv-lite')
}
// })
