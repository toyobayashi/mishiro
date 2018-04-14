import * as crypto from 'crypto'
import Rijndael from 'rijndael-js'
import * as msgpackLite from 'msgpack-lite'
import config from './resolve-config'
import configurer from '../common/config'
import request from '../common/request'

let g: any = global
const msgpackLiteOptions = { codec: msgpackLite.createCodec({ useraw: true }) }
const msgpack = {
  encode: (o: any) => msgpackLite.encode(o, msgpackLiteOptions),
  decode: (o: Buffer) => msgpackLite.decode(o)
}

class ApiClient {
  static VIEWER_ID_KEY: string = 'cyU1Vk5RKEgkJkJxYjYjMys3OGgyOSFGdDR3U2cpZXg='
  static SID_KEY: string = 'ciFJQG50OGU1aT0='
  static cryptoGrapher = { // 4位16进制表示长度 + 每个字符变成(两位随机数 + (ascii码 + 10的字符) + 一位随机数) + 32位随机数
    encode (s: string) {
      let arr = []
      for (let i = 0; i < s.length; i++) {
        let c = s[i]
        arr.push(createRandomNumberString(2) + chr(ord(c) + 10) + createRandomIntNumberFromZeroTo(10))
      }
      return $04x(s.length) + arr.join('') + createRandomNumberString(32)
    },
    decode (s: string) {
      let l = parseInt(s.substr(0, 4), 16)
      let e = ''
      for (let i = 6; i < s.length; i += 4) {
        e += s[i]
      }
      e = e.substr(0, l)
      let arr = []
      for (let i = 0; i < e.length; i++) {
        arr.push(chr(ord(e[i]) - 10))
      }
      return arr.join('')
    }
  }
  static cryptAES = { // rijndael256cbc
    encryptRJ256 (s: string, iv: string, key: string) {
      let cipher = new Rijndael(key, 'cbc')
      let ciphertext = cipher.encrypt(s, 256, iv)
      let ascii = ''
      for (let i = 0; i < ciphertext.length; i++) {
        ascii += chr(ciphertext[i])
      }
      return ascii
    },
    decryptRJ256 (s: Buffer, iv: string, key: string) {
      let cipher = new Rijndael(key, 'cbc')
      let plaintext = cipher.decrypt(s, 256, iv)
      let ascii = ''
      for (let i = 0; i < plaintext.length; i++) {
        ascii += chr(plaintext[i])
      }
      return ascii
    }
  }

  user: string
  viewer: string
  udid: string
  sid: string
  resVer: string
  constructor (account: string, resVer: string) {
    this.user = account.split(':')[0]
    this.viewer = account.split(':')[1]
    this.udid = account.split(':')[2]
    this.sid = ''
    this.resVer = resVer
  }

  post (path: string, args: any) {
    let viewerIV = createRandomNumberString(32)
    args.timezone = '09:00:00'
    args.viewer_id = viewerIV + b64encode(ApiClient.cryptAES.encryptRJ256(this.viewer, viewerIV, b64decode(ApiClient.VIEWER_ID_KEY)))
    let plain = b64encode(msgpack.encode(args))
    let key = b64encode($xFFFF32()).substring(0, 32)
    let bodyIV = this.udid.replace(/-/g, '')
    let body = b64encode(ApiClient.cryptAES.encryptRJ256(plain, bodyIV, key) + key)
    let sid = this.sid ? this.sid : this.viewer + this.udid
    let headers = {
      'PARAM': sha1(this.udid + this.viewer + path + plain),
      'KEYCHAIN': '',
      'USER_ID': ApiClient.cryptoGrapher.encode(this.user),
      'CARRIER': 'google',
      'UDID': ApiClient.cryptoGrapher.encode(this.udid),
      'APP_VER': '9.9.9',
      'RES_VER': this.resVer,
      'IP_ADDRESS': '127.0.0.1',
      'DEVICE_NAME': 'Nexus 42',
      'X-Unity-Version': '5.1.2f1',
      'SID': md5(sid + b64decode(ApiClient.SID_KEY)),
      'GRAPHICS_DEVICE_NAME': '3dfx Voodoo2 (TM)',
      'DEVICE_ID': md5('Totally a real Android'),
      'PLATFORM_OS_VERSION': 'Android OS 13.3.7 / API-42 (XYZZ1Y/74726f6c6c)',
      'DEVICE': '2',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 13.3.7; Nexus 42 Build/XYZZ1Y)'
    }
    return new Promise((resolve, reject) => {
      request({
        url: 'https://game.starlight-stage.jp' + path,
        method: 'POST',
        headers: headers,
        timeout: 10000,
        body: body
      }, (err?: Error | null, body?: string | null) => {
        if (!err) {
          let bin = Buffer.from(body || '', 'base64')
          let data = bin.slice(0, bin.length - 32)
          let key = bin.slice(bin.length - 32).toString('ascii')
          let plain = ApiClient.cryptAES.decryptRJ256(data, bodyIV, key)

          let msg = msgpack.decode(Buffer.from(plain, 'base64'))
          this.sid = typeof msg === 'object' ? (msg.data_headers ? msg.data_headers.sid : void 0) : void 0
          resolve(msg)
        } else reject(err)
      })
    })
  }

  async check () {
    let res: any
    try {
      res = await this.post('/load/check', {
        campaign_data: '',
        campaign_user: 1337,
        campaign_sign: md5('All your APIs are belong to us'),
        app_type: 0
      })
    } catch (err) {
      console.log(err)
      return false
    }
    if (res.data_headers.result_code === 214) {
      let resVer = Number(res.data_headers.required_res_ver)
      console.log('/load/check [New Version] ' + this.resVer + ' => ' + resVer)
      this.resVer = res.data_headers.required_res_ver
      configurer.configure('latestResVer', resVer)
      g.config.latestResVer = resVer
      return resVer
    } else if (res.data_headers.result_code === 1) {
      console.log('/load/check [latest Version] ' + this.resVer)
      return Number(this.resVer)
    } else {
      return false
    }
  }

  async getProfile (viewer: string | number) {
    try {
      let res = await this.post('/profile/get_profile', { friend_id: viewer.toString() })
      return res
    } catch (err) {
      throw err
    }
  }

  async getGachaRate (gacha: string | number) {
    try {
      let res = await this.post('/gacha/get_rate', { gacha_id: gacha.toString() })
      return res
    } catch (err) {
      throw err
    }
  }
}

function chr (code: number) {
  return String.fromCharCode(code)
}

function ord (str: string) {
  return str.charCodeAt(0)
}

function createRandomIntNumberFromZeroTo (r: number) {
  return Math.floor(r * Math.random())
}

function createRandomNumberString (l: number) {
  let s = ''
  for (let i = 0; i < l; i++) {
    s += createRandomIntNumberFromZeroTo(10)
  }
  return s
}

function $04x (n: number) {
  let s = n.toString(16)
  let d = 4 - s.length
  return Array.from({ length: d }, () => '0').join('') + s
}

function $xFFFF32 () {
  let s = []
  for (let i = 0; i < 32; i++) {
    s.push(createRandomIntNumberFromZeroTo(65536).toString(16))
  }
  return s.join('')
}

function b64encode (s: string | Buffer) {
  if (typeof s === 'string') return Buffer.from(s, 'ascii').toString('base64')
  else if (s.constructor === Buffer) return s.toString('base64')
  throw new TypeError('b64encode (s: string | Buffer)')
}

function b64decode (s: string) {
  return Buffer.from(s, 'base64').toString('ascii')
}

function sha1 (s: string) {
  return crypto.createHash('sha1').update(s).digest('hex')
}

function md5 (s: string) {
  return crypto.createHash('md5').update(s).digest('hex')
}

let client = new ApiClient(config.account || '940464243:174481488:cf608be5-6d38-421a-8eb1-11a501132c0a', config.latestResVer.toString())
g.client = client

export { config }
export default client
