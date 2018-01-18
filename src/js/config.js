import fs from 'fs'
import { getPath } from './getPath.js'
class Configurer {
  constructor (filePath) {
    this.configFile = filePath
  }
  getConfig () {
    if (fs.existsSync(this.configFile)) {
      return JSON.parse(fs.readFileSync(this.configFile))
    } else {
      return {}
    }
  }
  configure (key, value) {
    let config = this.getConfig()
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
  }
  remove (key) {
    let config = this.getConfig()
    delete config[key]
    fs.writeFileSync(this.configFile, JSON.stringify(config, null, '  '))
  }
}
export let configurer = new Configurer(getPath('./config.json'))
export default new Configurer(getPath('../config.json'))
