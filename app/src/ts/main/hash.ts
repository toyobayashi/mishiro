
import { Writable, WritableOptions } from 'stream'
import { createReadStream } from 'fs-extra'
import { createHash } from 'crypto'

class HashResult extends Writable {
  private _value: string
  private _defer: {
    resolve: (value: string | PromiseLike<string>) => void
    reject: (reason?: any) => void
  }

  public readonly promise: Promise<string>
  public constructor (o?: WritableOptions) {
    super(o)
    this._value = ''
    Object.defineProperty(this, 'promise', {
      enumerable: true,
      configurable: true,
      writable: false,
      value: new Promise<string>((resolve, reject) => {
        this._defer = { resolve, reject }
        this.once('error', reject)
      })
    })
  }

  _write (chunk: any, _encoding: string, cb: (err?: Error) => void): void {
    this._value = chunk.toString('hex')
    cb()
  }

  _final (cb: (err?: Error) => void): void {
    this._defer.resolve(this._value)
    cb()
  }
}

export function md5File (path: string): Promise<string> {
  try {
    return createReadStream(path).pipe(createHash('md5')).pipe(new HashResult()).promise
  } catch (err) {
    return Promise.reject(err)
  }
}
