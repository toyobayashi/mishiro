import * as fs from 'fs-extra'
import getPath from './get-path'

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
  private readonly configFile: string
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

  getConfig (): MishiroConfig {
    return this.config
  }

  configure (obj: MishiroConfigKey | MishiroConfig, value?: any): MishiroConfig {
    if (typeof obj === 'string') {
      this.config[obj] = value
      fs.writeJsonSync(this.configFile, this.config, { spaces: 2 })
    } else {
      for (const k in obj) {
        const mishiroConfigKey = k as MishiroConfigKey
        if (obj[mishiroConfigKey]) {
          (this.config as any)[mishiroConfigKey] = obj[mishiroConfigKey]
        } else {
          if (this.config[mishiroConfigKey] !== undefined) {
            delete this.config[mishiroConfigKey]
          }
        }
      }
      fs.writeJsonSync(this.configFile, this.config, { spaces: 2 })
    }
    return this.config
  }

  remove (key: MishiroConfigKey): MishiroConfig {
    if (this.config[key] !== undefined) {
      delete this.config[key]
      fs.writeJsonSync(this.configFile, this.config, { spaces: 2 })
    }
    return this.config
  }
}

const configurer = new Configurer(getPath.configPath)
__non_webpack_require__('./export.js').setCache('configurer', configurer)

export default configurer
