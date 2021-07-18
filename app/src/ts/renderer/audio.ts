// import getPath from '../common/get-path'

const fs = window.node.fs
// const path = window.node.path

function emit (listeners: Record<string, Function[]>, event: string, thisArg: any, ...args: any[]): void {
  if (listeners[event]) {
    listeners[event].slice().forEach(f => {
      f.call(thisArg, ...args)
    })
  }
}

class MishiroAudio {
  #listeners: Record<string, Function[]> = Object.create(null)
  #src: string = ''
  #startedAt: number = 0
  #pausedAt: number = 0
  #duration: number = 0

  #ctx: AudioContext = new AudioContext()
  #source: AudioBufferSourceNode | null = null
  #audioBuffer: AudioBuffer | null = null

  public onended: null | (() => void) = null
  public oncanplay: null | (() => void) = null

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

  // public constructor () {
  //   setInterval(() => {
  //     // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  //     console.log('currentTime: ' + this.currentTime)
  //   }, 500)
  // }

  public get src (): string {
    return this.#src
  }

  public set src (value: string) {
    const buffer = fs.readFileSync(value)
    const ab = buffer.buffer
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.#ctx.decodeAudioData(ab, (audioBuffer) => {
      this.#audioBuffer = audioBuffer
      this.#duration = audioBuffer.duration
      this.#startedAt = 0
      this.#pausedAt = 0
      emit(this.#listeners, 'durationchange', this)
      emit(this.#listeners, 'canplay', this)
      if (this.oncanplay) this.oncanplay()
    })
    this.#src = value
  }

  public get currentTime (): number {
    let t = 0
    if (this.#pausedAt) {
      t = this.#pausedAt
      return t
    } else if (this.#startedAt) {
      t = this.#ctx.currentTime - this.#startedAt
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
      this._initSource(this.#audioBuffer)
      this.#startedAt = this.#ctx.currentTime - value
      this.#pausedAt = 0
      this.#source?.start(0, value)

      window.clearInterval(this.#timeupdateTimer)
      emit(this.#listeners, 'timeupdate', this)
      this.#timeupdateTimer = window.setInterval(() => {
        emit(this.#listeners, 'timeupdate', this)
      }, 250)
    }
  }

  public get duration (): number {
    return this.#duration
  }

  private _initSource (audioBuffer: AudioBuffer): void {
    try {
      if (this.#source) {
        this.#source.disconnect()
        this.#source.stop()
        this.#source = null
      }
    } catch (_) {}
    this.#source = this.#ctx.createBufferSource()
    this.#source.buffer = audioBuffer
    this.#source.loop = this.loop
    this.#source.loopStart = this.loopStart
    this.#source.loopEnd = this.loopEnd
    // this.#source.onended = () => {
    //   console.log('source.onended')
    // }
    this.#source.connect(this.#ctx.destination)
  }

  public play (): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.#audioBuffer) {
        reject(new Error('no source'))
        return
      }

      this._initSource(this.#audioBuffer)
      const offset = this.#pausedAt
      this.#source?.start(0, offset)
      this.#startedAt = this.#ctx.currentTime - offset
      this.#pausedAt = 0
      resolve()
      window.clearInterval(this.#timeupdateTimer)
      emit(this.#listeners, 'timeupdate', this)
      this.#timeupdateTimer = window.setInterval(() => {
        emit(this.#listeners, 'timeupdate', this)
      }, 250)
    })
  }

  public pause (): void {
    if (this.#source) {
      this.#source.disconnect()
      this.#source.stop()
      this.#source = null
      this.#pausedAt = this.#ctx.currentTime - this.#startedAt
      this.#startedAt = 0
    }
    window.clearInterval(this.#timeupdateTimer)
  }

  public addEventListener (event: string, listener: (...args: any[]) => any, _captureOrOptions?: boolean): void {
    if (!this.#listeners[event]) this.#listeners[event] = []
    this.#listeners[event].push(listener)
  }

  public removeEventListener (event: string, listener: (...args: any[]) => any, _captureOrOptions?: boolean): void {
    if (!this.#listeners[event]) return
    const index = this.#listeners[event].indexOf(listener)
    if (index !== -1) {
      this.#listeners[event].splice(index, 1)
    }
  }
}

export default MishiroAudio
