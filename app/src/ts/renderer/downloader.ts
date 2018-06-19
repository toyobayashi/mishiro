import request, { ProgressInfo } from '../common/request'
import * as fs from 'fs'
import * as path from 'path'
import { ClientRequest } from 'http'
class Downloader {
  taskArr: string[][]
  req: ClientRequest | undefined | null
  index: number
  isContinue: boolean
  constructor (taskArr = []) {
    this.taskArr = taskArr // [ [url, path, data] ]
    this.req = null
    this.index = -1
    this.isContinue = true
  }

  download (u: string, p: string, progressing?: (prog: ProgressInfo) => void): Promise<string> {
    // let filename = this.toName(p)
    return new Promise((resolve, reject) => {
      this.req = request({
        url: u,
        path: p,
        onData: progressing,
        headers: {
          'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)',
          'X-Unity-Version': '5.1.2f1',
          'Accept-Encoding': 'gzip',
          'Connection': 'Keep-Alive'
        }
      }, (err, _res, p) => {
        if (err) {
          // console.log(err)
          if (err.message === 'abort' || /^[4-9][0-9][0-9]$/.test(err.message)) resolve('')
          else reject(err)
        } else {
          resolve(p as string)
        }
      })
    })
  }

  async batchDl (
    taskArr: string[][],
    start?: (name: string, path: string, data: any) => void,
    progressing?: (prog: ProgressInfo) => void,
    complete?: (name: string, path: string, data: any) => void,
    stop?: (name: string, path: string, data: any) => void
  ) {
    this.taskArr = taskArr
    this.index = 0
    this.isContinue = true
    let errorList = []

    for (this.index = 0; this.index < this.taskArr.length; this.index++) {
      let url = this.taskArr[this.index][0]
      let filepath = this.taskArr[this.index][1]
      let data = this.taskArr[this.index][2]

      if (!fs.existsSync(filepath)) {
        if (start) start(this.toName(filepath), filepath, data)
        try {
          // let noAborted =
          await this.download(url, filepath, progressing)
          // if (!noAborted) errorList.push(filepath)
        } catch (e) {
          errorList.push(filepath)
          this.isContinue = false
        }
      }
      if (this.isContinue) {
        if (complete) complete(this.toName(filepath), filepath, data)
      } else {
        if (stop) stop(this.toName(filepath), filepath, data)
      }
    }
    this.taskArr = []
    this.index = -1
    return errorList
  }

  stop (failed?: () => void) {
    this.isContinue = false
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

  toName (p: string) {
    return path.basename(p)
  }
}

export default Downloader
