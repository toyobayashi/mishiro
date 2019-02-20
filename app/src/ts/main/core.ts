import configurer from './config'
import { Client } from 'mishiro-core'
import { execSync as system } from 'child_process'
import * as Updater from 'electron-github-asar-updater'
import { app, dialog } from 'electron'

let _$_$_
try {
  _$_$_ = require('./_$_$_').default
} catch (err) {
  dialog.showErrorBox('Error', 'Account not found.')
  app.quit()
}

const updater = new Updater('toyobayashi/mishiro')

declare namespace global {
  export let mishiroCore: typeof import('mishiro-core')
  export let client: Client
  export let execSync: any
  export let updater: Updater
}

global.mishiroCore = require('mishiro-core')

let config = configurer.getConfig()

const confver = config.latestResVer
const confacc = config.account

global.client = new Client(
  confacc || Buffer.from(_$_$_, 'base64').toString(),
  confver !== void 0 ? confver.toString() : void 0
)

global.execSync = function (command: string) {
  return system(command)
}

global.updater = updater

export * from 'mishiro-core'
