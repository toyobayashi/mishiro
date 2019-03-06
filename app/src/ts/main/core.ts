import configurer from './config'
import * as core from 'mishiro-core'
import { execSync as system } from 'child_process'
import * as Updater from 'electron-github-asar-updater'
// import { app, dialog } from 'electron'

// let _$_$_
// try {
//   _$_$_ = require('./_$_$_').default
// } catch (err) {
//   dialog.showErrorBox('Error', 'Account not found.')
//   app.quit()
// }

const updater = new Updater('toyobayashi/mishiro')

declare namespace global {
  export let mishiroCore: typeof import('mishiro-core')
  export let client: core.Client
  export let execSync: any
  export let updater: Updater
}

global.mishiroCore = core

let config = configurer.getConfig()

const confver = config.latestResVer
const confacc = config.account

global.client = new core.Client(
  confacc || '::',
  confver !== void 0 ? (confver - 100).toString() : void 0
)

global.execSync = function (command: string) {
  return system(command)
}

global.updater = updater

export * from 'mishiro-core'
