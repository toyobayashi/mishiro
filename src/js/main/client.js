import crypto from 'crypto'
import Rijndael from 'rijndael-js'
import msgpackLite from 'msgpack-lite'
import config from './resolve-config.js'
import configurer from '../common/config.js'
import request from '../common/request.js'

const msgpackLiteOptions = { codec: msgpackLite.createCodec({ useraw: true }) }
const msgpack = {
  encode: o => msgpackLite.encode(o, msgpackLiteOptions),
  decode: o => msgpackLite.decode(o)
}

class ApiClient {
  constructor (account, resVer) {
    this.user = account.split(':')[0]
    this.viewer = account.split(':')[1]
    this.udid = account.split(':')[2]
    this.sid = void 0
    this.resVer = resVer
  }

  post (path, args) {
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
      }, (err, body) => {
        if (err) reject(err)
        else {
          let bin = Buffer.from(body, 'base64')
          let data = bin.slice(0, bin.length - 32)
          let key = bin.slice(bin.length - 32).toString('ascii')
          let plain = ApiClient.cryptAES.decryptRJ256(data, bodyIV, key)

          let msg = msgpack.decode(Buffer.from(plain, 'base64'))
          this.sid = typeof msg === 'object' ? (msg.data_headers ? msg.data_headers.sid : void 0) : void 0
          resolve(msg)
        }
      })
      /* let req = https.request({
        protocol: 'https:',
        host: 'game.starlight-stage.jp',
        method: 'POST',
        path: path,
        headers: headers,
        timeout: 10000
      }, res => {
        let chunks = []
        let size = 0
        res.on('data', chunk => {
          chunks.push(chunk)
          size += chunk.length
        })
        res.on('end', () => {
          let buf = Buffer.alloc(size)
          let pos = 0
          for (const chunk of chunks) {
            chunk.copy(buf, pos)
            pos += chunk.length
          }
          let body = buf.toString()
          let bin = Buffer.from(body, 'base64')
          let data = bin.slice(0, bin.length - 32)
          let key = bin.slice(bin.length - 32).toString('ascii')
          let plain = ApiClient.cryptAES.decryptRJ256(data, bodyIV, key)

          let msg = msgpack.decode(Buffer.from(plain, 'base64'))
          this.sid = typeof msg === 'object' ? (msg.data_headers ? msg.data_headers.sid : void 0) : void 0
          resolve(msg)
        })
      })
      req.on('error', err => {
        console.log(err)
        reject(err)
      })
      req.write(body)
      req.end() */
    })
  }

  async check () {
    let res
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
      global.config.latestResVer = resVer
      return resVer
    } else if (res.data_headers.result_code === 1) {
      console.log('/load/check [latest Version] ' + this.resVer)
      return Number(this.resVer)
    } else {
      return false
    }
  }

  async getProfile (viewer) {
    try {
      let res = await this.post('/profile/get_profile', { friend_id: viewer.toString() })
      return res
    } catch (err) {
      throw err
    }
  }

  async getGachaRate (gacha) {
    try {
      let res = await this.post('/gacha/get_rate', { gacha_id: gacha.toString() })
      return res
    } catch (err) {
      throw err
    }
  }
}
ApiClient.VIEWER_ID_KEY = 'cyU1Vk5RKEgkJkJxYjYjMys3OGgyOSFGdDR3U2cpZXg='
ApiClient.SID_KEY = 'ciFJQG50OGU1aT0='

ApiClient.cryptoGrapher = { // 4位16进制表示长度 + 每个字符变成(两位随机数 + (ascii码 + 10的字符) + 一位随机数) + 32位随机数
  encode (s) {
    let arr = []
    for (let i = 0; i < s.length; i++) {
      let c = s[i]
      arr.push(createRandomNumberString(2) + chr(ord(c) + 10) + createRandomIntNumberFromZeroTo(10))
    }
    return $04x(s.length) + arr.join('') + createRandomNumberString(32)
  },
  decode (s) {
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

ApiClient.cryptAES = { // rijndael256cbc
  encryptRJ256 (s, iv, key) {
    let cipher = new Rijndael(key, 'cbc')
    let ciphertext = cipher.encrypt(s, 256, iv)
    let ascii = ''
    for (let i = 0; i < ciphertext.length; i++) {
      ascii += chr(ciphertext[i])
    }
    return ascii
  },
  decryptRJ256 (s, iv, key) {
    let cipher = new Rijndael(key, 'cbc')
    let plaintext = cipher.decrypt(s, 256, iv)
    let ascii = ''
    for (let i = 0; i < plaintext.length; i++) {
      ascii += chr(plaintext[i])
    }
    return ascii
  }
}

function chr (code) {
  return String.fromCharCode(code)
}

function ord (str) {
  return str.charCodeAt()
}

function createRandomIntNumberFromZeroTo (r) {
  return Math.floor(r * Math.random())
}

function createRandomNumberString (l) {
  let s = ''
  for (let i = 0; i < l; i++) {
    s += createRandomIntNumberFromZeroTo(10)
  }
  return s
}

function $04x (n) {
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

function b64encode (s) {
  return Buffer.from(s, 'ascii').toString('base64')
}

function b64decode (s) {
  return Buffer.from(s, 'base64').toString('ascii')
}

function sha1 (s) {
  return crypto.createHash('sha1').update(s).digest('hex')
}

function md5 (s) {
  return crypto.createHash('md5').update(s).digest('hex')
}

let client = new ApiClient(config.account || '940464243:174481488:cf608be5-6d38-421a-8eb1-11a501132c0a', config.latestResVer.toString())
global.client = client

export { config }
export default client
