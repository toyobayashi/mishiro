import * as electron from 'electron'

const cache = electron.remote.require('./export.js')

const os: typeof import('os') = electron.remote.require('os')

process.once('loaded', function () {
  window.preload = {
    package: electron.remote.require('../package.json'),
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
    process: {
      arch: process.arch,
      versions: process.versions,
      platform: process.platform
    },
    got: electron.remote.require('got'),
    electron,
    mishiroCore: electron.remote.require('mishiro-core'),
    fs: electron.remote.require('fs-extra'),
    os: {
      type: os.type,
      release: os.release,
      EOL: os.EOL
    },
    path: electron.remote.require('path'),
    url: electron.remote.require('url'),
    childProcess: {
      execSync: electron.remote.require('child_process').execSync
    }
  }
})
