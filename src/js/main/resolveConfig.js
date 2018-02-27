import request from 'request'
import { configurer } from '../common/config.js'

function getResourceVersionFromMishiroLab () {
  return new Promise((resolve) => {
    request('https://starlight.kirara.ca/api/v1/info', (err, res, body) => {
      if (err) resolve(false)
      else {
        let v = Number(JSON.parse(body).truth_version)
        console.log('Resver got: ' + v)
        resolve(v)
      }
    })
  })
}

let config = (async function () {
  let config = await configurer.getConfig()
  let fix = {}
  if (!config.latestResVer) {
    let rv346 = await getResourceVersionFromMishiroLab()
    fix.latestResVer = rv346 || 10035900
  }
  if (config.language !== 'zh' && config.language !== 'ja') {
    fix.language = 'zh'
  }
  if (Object.keys(fix).length) {
    let c = await configurer.configure(fix)
    return c
  } else {
    return config
  }
})()

export default config
