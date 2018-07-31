import { ProgressInfo } from 'mishiro-core'
import { remote } from 'electron'

let configurerR: typeof configurer = remote.getGlobal('configurer')
let clientR: typeof client = remote.getGlobal('client')
const core: typeof mishiroCore = remote.getGlobal('mishiroCore')

let current = 0
let max = 20

function httpGetVersion (resVer: number, progressing: (prog: ProgressInfo) => void): Promise<{ version: number; isExisting: boolean}> {
  const option = {
    // method: 'GET',
    url: `http://storage.game.starlight-stage.jp/dl/${resVer}/manifests/all_dbmanifest`,
    headers: {
      'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)',
      'X-Unity-Version': '5.4.5p1',
      'Accept-Encoding': 'gzip'
    }
  }
  return new Promise((resolve) => {
    core.util.request(option, (err) => {
      if (err) {
        resolve({ version: resVer, isExisting: false })
      } else {
        current++
        progressing({ current, max, loading: 100 * current / max })
        resolve({ version: resVer, isExisting: true })
      }
    })
    /* request(option, (err, res) => {
      if (err) {
        resolve({ version: resVer, isExisting: false })
      } else {
        current++
        progressing({ current, max, loading: 100 * current / max })
        if (res.statusCode === 200) {
          resolve({ version: resVer, isExisting: true })
        } else {
          resolve({ version: resVer, isExisting: false })
        }
      }
    }) */
  })
}

async function check (progressing: (prog: ProgressInfo) => void) {
  let config = configurerR.getConfig()
  if (config.resVer) {
    return config.resVer
  }
  let res = await clientR.check()
  if (res !== 0) {
    if (res > (configurerR.getConfig().latestResVer as number)) {
      console.log(`/load/check [New Version] ${configurerR.getConfig().latestResVer as number} => ${res}`)
    } else {
      console.log(`/load/check [Latest Version] ${res}`)
    }
    configurerR.configure('latestResVer', res)
    clientR.resVer = res.toString()
    return res
  } else {
    console.log('/load/check failed')
  }

  let versionFrom = config.latestResVer as number

  return new Promise((resolve) => {
    let resVer = versionFrom

    function checkVersion (versionFrom: number) {
      let versionArr = []
      for (let i = 10; i < 210; i += 10) {
        versionArr.push(Number(versionFrom) + i)
      }
      let promiseArr: Promise<{ version: number; isExisting: boolean}>[] = []
      versionArr.forEach((v) => {
        promiseArr.push(httpGetVersion(v, progressing))
      })
      Promise.all(promiseArr).then(async (arr) => {
        max += 20
        let temp = arr
        let isContinue = false
        for (let i = temp.length - 1; i >= 0; i--) {
          if (temp[i].isExisting === true) {
            isContinue = true
            resVer = temp[i].version
            checkVersion(temp[temp.length - 1].version)
            break
          }
        }
        if (!isContinue) {
          configurerR.configure('latestResVer', resVer)
          clientR.resVer = resVer.toString()
          resolve(resVer)
        }
      })
    }
    checkVersion(versionFrom)
  }) as Promise<number>
}
export default check
