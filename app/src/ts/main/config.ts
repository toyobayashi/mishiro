import * as fs from 'fs-extra'
import getPath from './get-path'
import * as request from 'request'

declare namespace global {
  export let configurer: Configurer
  export let fs: typeof import('fs-extra')
  export let request: typeof import('request')
}

export interface MishiroConfig {
  latestResVer?: number
  resVer?: number
  gacha?: number
  event?: number
  language?: 'zh' | 'ja' | 'en'
  background?: number
  account?: string
  card?: 'default' | 'kirara'
}

export type MishiroConfigKey = keyof MishiroConfig

export class Configurer {
  private configFile: string
  private config: MishiroConfig
  constructor (configFile: string) {
    this.configFile = configFile
    if (!fs.existsSync(configFile)) {
      this.config = {
        latestResVer: 10052300,
        language: 'zh',
        card: 'default'
      }
    } else {
      this.config = fs.readJsonSync(configFile) || {}
      this.config.latestResVer = this.config.latestResVer || 10052300
      this.config.language = this.config.language || 'zh'
      this.config.card = this.config.card || 'default'
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
    } else {
      for (let k in obj) {
        let mishiroConfigKey = k as MishiroConfigKey
        if (obj[mishiroConfigKey]) {
          (this.config as any)[mishiroConfigKey] = obj[mishiroConfigKey]
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

global.configurer = new Configurer(getPath.configPath)
global.fs = fs
global.request = request

export default global.configurer
