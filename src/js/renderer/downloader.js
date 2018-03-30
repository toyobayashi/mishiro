import request from 'request'
import fs from 'fs'
import { read } from '../util/fse.js'
import path from 'path'
class Downloader {
  constructor (taskArr = []) {
    this.taskArr = taskArr // [ [url, path, data] ]
    this.req = null
    this.index = -1
  }

  download (u, p, progressing, completed) {
    let filename = this.toName(p)
    return new Promise(async (resolve, reject) => {
      if (fs.existsSync(p)) {
        resolve(p)
      } else {
        let size = 0
        if (fs.existsSync(p + '.tmp')) {
          const f = await read(p + '.tmp')
          size = f.length
        }

        let options = null

        if (size > 0) {
          options = {
            url: u,
            timeout: 5000,
            headers: {
              'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)',
              'X-Unity-Version': '5.1.2f1',
              'Accept-Encoding': 'gzip',
              'Range': 'bytes=' + size + '-',
              'Connection': 'Keep-Alive'
            }
          }
        } else {
          options = {
            url: u,
            timeout: 5000,
            headers: {
              'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)',
              'X-Unity-Version': '5.1.2f1',
              'Accept-Encoding': 'gzip',
              'Connection': 'Keep-Alive'
            }
          }
        }

        let current = 0
        let contentLength = 0

        let req = request(options)
        this.req = req
        let rename = true

        req.on('response', (response) => {
          if (response.statusCode === 404) {
            rename = false
            resolve(false)
            return
          }
          contentLength = Number(response.headers['content-length'])
          if (contentLength == size && !response.headers['content-range']) {
            resolve(p)
            req.abort()
            progressing({
              current: size,
              max: size,
              loading: 100
            })
          } else {
            let ws = fs.createWriteStream(p + '.tmp', { flags: 'a+' })
            req
              .on('data', (data) => {
                current += data.length
                progressing({
                  name: filename,
                  current: size + current,
                  max: size + contentLength,
                  loading: 100 * (size + current) / (size + contentLength),
                  completed: completed || 0
                })
              })
              .on('abort', () => {
                rename = false
                console.log('abort: ' + u)
                this.req = null
                resolve(false)
              })
              /* .on('end', () => {
                if (rename) {
                  fs.renameSync(path.join(p) + '.tmp', path.join(p))
                }
                resolve(p)
              }) */
            ws.on('close', () => {
              if (rename) {
                fs.renameSync(path.join(p) + '.tmp', path.join(p))
              }
              this.req = null
              resolve(p)
            })
            req.pipe(ws)
          }
        }).on('error', (e) => {
          console.log(e + '\nURL: ' + u)
          reject(p)
        })
      }
    })
  }

  async batchDl (taskArr, start, progressing, complete, stop) {
    this.taskArr = taskArr
    this.index = 0
    let errorList = []

    for (this.index = 0; this.index < this.taskArr.length; this.index++) {
      let url = this.taskArr[this.index][0]
      let filepath = this.taskArr[this.index][1]
      let data = this.taskArr[this.index][2]
      let isContinue = true
      let noAborted = false
      if (!fs.existsSync(filepath)) {
        if (start) start(this.toName(filepath), filepath, data)
        try {
          noAborted = await this.download(url, filepath, progressing, this.index)
        } catch (e) {
          errorList.push(e)
          isContinue = false
        }
      }
      if (isContinue) {
        if (complete && noAborted) complete(this.toName(filepath), filepath, data)
      } else {
        if (stop) stop(this.toName(filepath), filepath, data)
      }
    }
    this.taskArr = []
    this.index = -1
    return errorList
  }

  stop (failed) {
    if (this.taskArr.length) {
      this.taskArr = []
      if (this.req) {
        this.req.abort()
        this.req = null
      }
    } else {
      if (this.req) {
        this.req.abort()
        this.req = null
      }
      if (failed) failed()
    }
  }

  toName (p) {
    return path.parse(p).base
  }
}

export default Downloader
