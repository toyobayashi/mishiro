import * as fs from 'fs-extra'
import getPath from '../common/get-path'

export interface MishiroConfig {
  latestResVer?: number
  loopCount?: number
  resVer?: number
  gacha?: number
  event?: number
  language?: 'zh' | 'ja' | 'en'
  background?: number
  account?: string
  proxy?: string
  card?: 'default' | 'kirara'
  lrcEncoding?: 'utf8' | 'Windows932' | 'Windows936'
  audioExport?: 'wav' | 'mp3' | 'aac'
}

export type MishiroConfigKey = keyof MishiroConfig

export class Configurer {
  private readonly configFile: string
  private config: MishiroConfig
  constructor (configFile: string) {
    this.configFile = configFile
    if (!fs.existsSync(configFile)) {
      this.config = {
        latestResVer: 10088500,
        language: 'zh',
        card: 'default',
        lrcEncoding: 'utf8',
        audioExport: 'wav'
      }
    } else {
      this.config = fs.readJsonSync(configFile) || {}
      this.config.latestResVer = this.config.latestResVer || 10088500
      this.config.language = this.config.language || 'zh'
      this.config.card = this.config.card || 'default'
      this.config.lrcEncoding = this.config.lrcEncoding || 'utf8'
      this.config.audioExport = this.config.audioExport || 'wav'
    }
    fs.writeJsonSync(configFile, this.config, { spaces: 2 })
  }

  getAll (): MishiroConfig {
    return this.config
  }

  get<K extends MishiroConfigKey> (key: K): MishiroConfig[K] {
    return this.config[key]
  }

  set (obj: MishiroConfig): void
  set<K extends MishiroConfigKey> (obj: K | MishiroConfig, value: MishiroConfig[K]): void
  set<K extends MishiroConfigKey> (obj: K | MishiroConfig, value?: MishiroConfig[K]): void {
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
  }

  remove (key: MishiroConfigKey): void {
    if (this.config[key] !== undefined) {
      delete this.config[key]
      fs.writeJsonSync(this.configFile, this.config, { spaces: 2 })
    }
  }
}

const configurer = new Configurer(getPath.configPath)

export default configurer
