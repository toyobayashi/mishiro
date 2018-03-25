import https from 'https'
import configurer from '../common/config.js'
import client from './client.js'

function getResourceVersionFromMishiroLab () {
  return new Promise((resolve) => {
    https.get('https://starlight.kirara.ca/api/v1/info', res => {
      let body = ''
      res.on('data', chunk => { body += chunk })
      res.on('end', () => {
        let v = Number(JSON.parse(body).truth_version)
        console.log('Resver got: ' + v)
        resolve(v)
      })
      res.on('error', e => { resolve(false) })
    }).on('error', e => { resolve(false) })
  })
}

let config = (async function () {
  let config = await configurer.getConfig()
  let fix = {}
  if (!config.latestResVer) {
    let resVer = await client.check()
    let rv346 = resVer || await getResourceVersionFromMishiroLab()
    fix.latestResVer = rv346 || 10037000
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
