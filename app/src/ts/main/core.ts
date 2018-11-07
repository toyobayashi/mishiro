import configurer from './config'
import * as core from 'mishiro-core'
import { execSync as system } from 'child_process'

declare namespace global {
  export let mishiroCore: typeof core
  export let client: core.Client
  export let execSync: any
}

global.mishiroCore = core

let config = configurer.getConfig()

global.client = new core.Client(
  config.account || '940464243:174481488:cf608be5-6d38-421a-8eb1-11a501132c0a',
  config.latestResVer !== void 0 ? config.latestResVer.toString() : void 0
)

global.execSync = function (command: string) {
  return system(command)
}

// @ts-ignore
// namespace global {
//   let config = configurer.getConfig()
//   export let mishiroCore = core
//   export let client = new core.Client(
//     config.account || '940464243:174481488:cf608be5-6d38-421a-8eb1-11a501132c0a',
//     config.latestResVer !== void 0 ? config.latestResVer.toString() : void 0
//   )
//   export let execSync = system
// }

export * from 'mishiro-core'
