import { configurer } from '../common/config.js'

let config = (async function () {
  let config = await configurer.getConfig()
  let fix = {}
  if (!config.latestResVer) {
    fix.latestResVer = 10035900
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
