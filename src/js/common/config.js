import fs from 'fs'
import { read, write } from '../util/fse.js'
import getPath from './get-path.js'

class Configurer {
  constructor (filePath) {
    this.configFile = filePath
  }
  getConfigSync () {
    if (fs.existsSync(this.configFile)) {
      return JSON.parse(fs.readFileSync(this.configFile))
    } else {
      return {}
    }
  }
  async getConfig () {
    if (fs.existsSync(this.configFile)) {
      return JSON.parse(await read(this.configFile))
    } else {
      return {}
    }
  }
  async configure (key, value) {
    let config = await this.getConfig()
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
    await write(this.configFile, JSON.stringify(config, null, '  '))
    return config
  }
  async remove (key) {
    let config = await this.getConfig()
    delete config[key]
    await write(this.configFile, JSON.stringify(config, null, '  '))
    return config
  }
}

export default new Configurer(getPath('./config.json'))
