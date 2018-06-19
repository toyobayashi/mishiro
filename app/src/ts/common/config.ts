import * as fs from 'fs-extra'
import { configPath } from './get-path'

export class Configurer {
  configFile: string
  constructor (configFile: string) {
    this.configFile = configFile
  }
  getConfigSync () {
    if (fs.existsSync(this.configFile)) {
      return fs.readJsonSync(this.configFile)
    } else {
      return {}
    }
  }
  async getConfig () {
    if (fs.existsSync(this.configFile)) {
      return fs.readJson(this.configFile)
    } else {
      return {}
    }
  }
  configure (key: any, value?: any) {
    let config = this.getConfigSync()
    if (typeof key === 'string') {
      config[key] = value
    } else if (typeof key === 'object') {
      for (let k in key) {
        if (key[k]) {
          config[k] = key[k]
        } else {
          if (config[k] !== undefined) {
            delete config[k]
          }
        }
      }
    }
    fs.writeJsonSync(this.configFile, config, { spaces: 2 })
    return config
  }
  async remove (key: string) {
    let config = await this.getConfig()
    delete config[key]
    await fs.writeJson(this.configFile, config, { spaces: 2 })
    return config
  }
}

let configurer: Configurer = new Configurer(configPath)
export default configurer

export interface MishiroConfig {
  latestResVer?: number
  resVer?: number
  gacha?: number
  event?: number
  language?: string
  account?: string
}
