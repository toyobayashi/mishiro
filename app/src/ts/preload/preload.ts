import * as electron from 'electron'

process.once('loaded', function () {
  window.preload = {
    package: electron.remote.require('../package.json'),
    configurer: electron.remote.require('./export.js').getCache('configurer'),
    client: electron.remote.require('./export.js').getCache('client'),
    getPath: electron.remote.require('./export.js').getCache('getPath'),
    updater: electron.remote.require('./export.js').getCache('updater')
  }
  window.node = {
    process: {
      arch: process.arch,
      versions: process.versions
    },
    request: electron.remote.require('request'),
    electron,
    mishiroCore: electron.remote.require('mishiro-core'),
    fs: electron.remote.require('fs-extra'),
    path: electron.remote.require('path'),
    url: electron.remote.require('url'),
    childProcess: {
      execSync: electron.remote.require('child_process').execSync
    }
  }
})
