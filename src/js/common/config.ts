import * as fs from 'fs'
import { read, write } from '../util/fse'
import getPath from './get-path'

export class Configurer {
  configFile: string
  constructor (configFile: string) {
    this.configFile = configFile
  }
  getConfigSync () {
    if (fs.existsSync(this.configFile)) {
      return JSON.parse(fs.readFileSync(this.configFile, 'utf8'))
    } else {
      return {}
    }
  }
  async getConfig () {
    if (fs.existsSync(this.configFile)) {
      return JSON.parse(await read(this.configFile, 'utf8'))
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
    fs.writeFileSync(this.configFile, JSON.stringify(config, null, '  '))
    return config
  }
  async remove (key: string) {
    let config = await this.getConfig()
    delete config[key]
    await write(this.configFile, JSON.stringify(config, null, '  '))
    return config
  }
}

let configurer: Configurer = new Configurer(getPath('./config.json'))
export default configurer

export interface MishiroConfig {
  latestResVer?: number
  resVer?: number
  gacha?: number
  event?: number
  language?: string
  account?: string
}
