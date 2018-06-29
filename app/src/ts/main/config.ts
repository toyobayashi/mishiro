import * as fs from 'fs-extra'
import { configPath } from '../common/get-path'

declare namespace global {
  export let configurer: Configurer
  export let fsExtra: typeof fs
}

global.fsExtra = fs

export interface MishiroConfig {
  latestResVer?: number
  resVer?: number
  gacha?: number
  event?: number
  language?: 'zh' | 'ja' | 'en'
  background?: number
  account?: string
}

export type MishiroConfigKey = 'latestResVer' | 'resVer' | 'gacha' | 'event' | 'language' | 'background' | 'account'

export class Configurer {
  private configFile: string
  private config: MishiroConfig
  constructor (configFile: string) {
    this.configFile = configFile
    if (!fs.existsSync(configFile)) {
      this.config = {
        latestResVer: 10040400,
        language: 'zh'
      }
    } else {
      this.config = fs.readJsonSync(configFile) || {}
      this.config.latestResVer = this.config.latestResVer || 10040400
      this.config.language = this.config.language || 'zh'
    }
    fs.writeJsonSync(configFile, this.config, { spaces: 2 })
  }
  getConfig () {
    return this.config
  }
  configure (obj: MishiroConfigKey | MishiroConfig, value?: any) {
    if (typeof obj === 'string') {
      this.config[obj] = value
      fs.writeJsonSync(this.configFile, this.config, { spaces: 2 })
    } else if (typeof obj === 'object') {
      for (let k in obj) {
        let mishiroConfigKey = k as MishiroConfigKey
        if (obj[mishiroConfigKey]) {
          this.config[mishiroConfigKey] = obj[mishiroConfigKey]
        } else {
          if (this.config[mishiroConfigKey] !== void 0) {
            delete this.config[mishiroConfigKey]
          }
        }
      }
      fs.writeJsonSync(this.configFile, this.config, { spaces: 2 })
    }
    return this.config
  }
  remove (key: MishiroConfigKey) {
    if (this.config[key] !== void 0) {
      delete this.config[key]
      fs.writeJsonSync(this.configFile, this.config, { spaces: 2 })
    }
    return this.config
  }
}

global.configurer = new Configurer(configPath)

export default global.configurer
