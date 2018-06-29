import configurer from './config'
import * as core from 'mishiro-core'

declare namespace global {
  export let mishiroCore: typeof core
  export let client: core.Client
}

global.mishiroCore = core

let config = configurer.getConfig()

global.client = new core.Client(
  config.account || '940464243:174481488:cf608be5-6d38-421a-8eb1-11a501132c0a',
  config.latestResVer !== void 0 ? config.latestResVer.toString() : void 0
)

export * from 'mishiro-core'
