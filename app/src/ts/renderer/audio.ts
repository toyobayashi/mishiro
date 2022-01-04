// import getPath from '../common/get-path'
import type { Entry } from 'acb'
import type { BufferLike } from 'hca-decoder'

const fs = window.node.fs
const { EventEmitter } = window.node.events
const { HCADecoder } = window.node.hcaDecoder
const { Acb } = window.node.acb
// const path = window.node.path

class MishiroAudio extends EventEmitter {
  #ctx: AudioContext = new AudioContext()
  #gainNode = this.#ctx.createGain()

  #startedAt: number = 0 // absolute time
  #pausedAt: number = 0 // relative time
  #duration: number = 0

  #source: AudioBufferSourceNode | null = null
  #audioBuffer: AudioBuffer | null = null

  public loop: boolean = true
  #loopStart: number = 0
  #loopEnd: number = 0
  #timeupdateTimer = 0

  public get loopStart (): number {
    return this.#loopStart
  }

  public set loopStart (value: number) {
    this.#loopStart = value
    if (this.#source) this.#source.loopStart = value
  }

  public get loopEnd (): number {
    return this.#loopEnd
  }

  public set loopEnd (value: number) {
    this.#loopEnd = value
    if (this.#source) this.#source.loopEnd = value
  }

  public get currentTime (): number {
    let t = 0
    if (this.#pausedAt) {
      t = this.#pausedAt
      return t
    } else if (this.#startedAt) {
      t = this.#ctx.currentTime - this.#startedAt
      if (this.loop) {
        if (this.loopEnd > 0) {
          while (t > this.loopEnd) {
            this.#startedAt = this.#ctx.currentTime - (this.loopStart + (t - this.loopEnd))
            t = this.#ctx.currentTime - this.#startedAt
          }
        }
        while (t > this.duration) {
          this.#startedAt += this.duration
          t = this.#ctx.currentTime - this.#startedAt
        }
      } else {
        if (t > this.duration) t = this.duration
      }
      return t
    } else {
      return 0
    }
  }

  public set currentTime (value: number) {
    if (this.#pausedAt) {
      this.#pausedAt = value
      return
    }
    if (this.#startedAt) {
      if (!this.#audioBuffer) return
      this._initSource(this.#audioBuffer, true)
      this.#startedAt = this.#ctx.currentTime - value
      this.#pausedAt = 0
      this.#source?.start(0, value)

      window.clearInterval(this.#timeupdateTimer)
      this.emit('timeupdate')
      this.#timeupdateTimer = window.setInterval(() => {
        this.emit('timeupdate')
      }, 250)
    }
  }

  public get duration (): number {
    return this.#duration
  }

  public get volume (): number {
    return this.#gainNode.gain.value
  }

  public set volume (value: number) {
    if (Number.isNaN(value)) return
    this.#gainNode.gain.value = value > 1 ? 1 : (value < 0 ? 0 : value)
    this.emit('volumechange')
  }

  public constructor () {
    super()
    this.#gainNode.connect(this.#ctx.destination)
  }

  private _initSource (audioBuffer: AudioBuffer, clearOnEnded = false): void {
    try {
      if (this.#source) {
        if (clearOnEnded) this.#source.onended = null
        this.#source.stop()
        this.#source.disconnect()
        this.#source = null
      }
    } catch (_) {}
    this.#source = this.#ctx.createBufferSource()
    this.#source.buffer = audioBuffer
    this.#source.loop = this.loop
    this.#source.loopStart = this.loopStart
    this.#source.loopEnd = this.loopEnd
    this.#source.onended = () => {
      this.emit('ended')
    }
    this.#source.connect(this.#gainNode)
  }

  public async playRawSide (src: string | BufferLike): Promise<void> {
    const audioBuffer = await decodeAudioBuffer(this.#ctx, src)
    let source = this.#ctx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.#gainNode)
    source.start(0)
    source.onended = () => {
      source.disconnect()
      source = null!
    }
  }

  public async playHcaSide (src: string | BufferLike): Promise<void> {
    const wavBuffer = await hcaDecodeToMemory(src)
    await this.playRawSide(wavBuffer)
  }

  public async playHca (src: string | BufferLike): Promise<void> {
    if (typeof src === 'string' && src.includes('.asar')) {
      src = await fs.promises.readFile(src)
    }
    const wavBuffer = await hcaDecodeToMemory(src)
    await this.setRawSrc(wavBuffer)

    const info = HCADecoder.getInfo(src)
    if (info.loop) {
      this.#loopStart = this.#audioBuffer!.duration * (info.loop.start / info.blockCount)
      this.#loopEnd = this.#audioBuffer!.duration * (info.loop.end / info.blockCount)
    } else {
      this.#loopStart = 0
      this.#loopEnd = 0
    }
    await this.play()
  }

  public async setRawSrc (src: string | BufferLike): Promise<void> {
    if (typeof src === 'string' && src.includes('.asar')) {
      src = await fs.promises.readFile(src)
    }
    this.#audioBuffer = await decodeAudioBuffer(this.#ctx, src)
    this.#duration = this.#audioBuffer.duration
    this.#startedAt = 0
    this.#pausedAt = 0
    this.emit('durationchange')
    this.emit('canplay')

    await this.play()
  }

  public async playRaw (src: string | BufferLike): Promise<void> {
    await this.setRawSrc(src)
    await this.play()
  }

  /**
   * Continue playing
   */
  public async play (): Promise<void> {
    if (!this.#audioBuffer) {
      throw new Error('no source')
    }

    this._initSource(this.#audioBuffer, true)
    const offset = this.#pausedAt
    this.#source?.start(0, offset)
    this.#startedAt = this.#ctx.currentTime - offset
    this.#pausedAt = 0

    this.emit('play')

    window.clearInterval(this.#timeupdateTimer)
    this.emit('timeupdate')
    this.#timeupdateTimer = window.setInterval(() => {
      this.emit('timeupdate')
    }, 250)
  }

  public pause (): void {
    if (this.#source) {
      this.#source.onended = null
      this.#source.stop()
      this.#source.disconnect()
      this.#source = null
      this.#pausedAt = this.#ctx.currentTime - this.#startedAt
      this.#startedAt = 0
      this.emit('pause')
    }
    window.clearInterval(this.#timeupdateTimer)
  }
}

function hcaDecodeToMemory (src: string | BufferLike): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const hca = new HCADecoder()
    hca.decodeToMemory(src, 1, 16, 0, (err, buffer) => {
      if (err) {
        reject(err)
        return
      }
      resolve(buffer!)
    })
  })
}

async function decodeAudioBuffer (context: AudioContext, src: string | BufferLike): Promise<AudioBuffer> {
  let audioBuffer: AudioBuffer
  if (typeof src === 'string') {
    let ab = await fs.promises.readFile(src)
    audioBuffer = await context.decodeAudioData(ab.buffer)
    ab = null!
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.resolve().then(() => {
      if (typeof global.gc === 'function') global.gc()
    })
  } else {
    if (src instanceof ArrayBuffer) {
      audioBuffer = await context.decodeAudioData(src)
    } else {
      audioBuffer = await context.decodeAudioData(src.buffer)
    }
  }
  return audioBuffer
}

export function readAcb (acbFile: string): Entry[] {
  const utf = new Acb(acbFile)
  return utf.getFileList()
}

export { MishiroAudio }
