import * as electron from 'electron'

process.once('loaded', function () {
  window.preload = {
    package: electron.remote.require('../package.json'),
    configurer: electron.remote.getGlobal('configurer'),
    client: electron.remote.getGlobal('client'),
    getPath: electron.remote.getGlobal('getPath'),
    updater: electron.remote.getGlobal('updater')
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
