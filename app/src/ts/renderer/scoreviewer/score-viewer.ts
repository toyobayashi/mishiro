import Global, { globalInstance } from './global'
import type { ScoreNote } from '../../main/on-score'
// eslint-disable-next-line import/no-duplicates
import type Note from './note'
// eslint-disable-next-line import/no-duplicates
import type { ScoreNoteWithNoteInstance } from './note'
import TapNote from './tap-note'
import FlipNote from './flip-note'
import LongNote from './long-note'
import LongMoveNote from './long-move-note'
import { showSaveDialog } from '../ipc'
import getPath from '../../common/get-path'
import { MishiroAudio } from '../audio'
import { error } from '../log'
const { /* relative,  */parse } = window.node.path
const fs = window.node.fs
const { ipcRenderer } = window.node.electron

interface Song<ScoreType> {
  src: string
  bpm: number
  score: ScoreType[]
  fullCombo: number
  difficulty: string
}

interface Option {
  speed: number
}

class ScoreViewer {
  public static main (): void {
    const song = ipcRenderer.sendSync('getSong')
    if (!song) return

    // console.log(song)
    const name = parse(song.src).name.substr(parse(song.src).name.indexOf('-') + 1)
    document.getElementsByTagName('title')[0].innerHTML = name
    const sv = ScoreViewer.init(song, document.body)
    sv.start()
    // if (process.env.NODE_ENV !== 'production') {
    //   (document.getElementById('debug') as HTMLButtonElement).addEventListener('click', () => {
    //     const base64str = sv.frontCanvas.toDataURL('image/png').substr(22)
    //     writeFile(getPath.scoreDir(name + '.png'), Buffer.from(base64str, 'base64'))
    //     // console.log(sv.frontCanvas.toDataURL('image/png').substr(22))
    //   }, false)
    // }
  }

  private static _instance: ScoreViewer | null = null
  public static init (song: Song<ScoreNote>, el: HTMLElement, options?: Option): ScoreViewer {
    return new ScoreViewer(song, el, options)
  }

  public static calY (speed: number, sec: number, currentTime: number): number {
    return ScoreViewer.TOP_TO_TARGET_POSITION - (~~(speed * 60 * (sec - currentTime)))
  }

  public static saveCalY (sv: ScoreViewer, sec: number): number {
    return sv.saveCanvas.height - ((~~(globalInstance.saveSpeed * 60 * (sec)))) / globalInstance.scale
  }

  private static readonly CANVAS_WIDTH = 867
  private static readonly CANVAS_HEIGHT = 720
  public static X: number[] = [238 - 206, 414 - 206, 589 - 206, 764 - 206, 937 - 206]
  private static readonly BOTTOM = 20
  public static TOP_TO_TARGET_POSITION = ScoreViewer.CANVAS_HEIGHT - ScoreViewer.BOTTOM - 114 + 6

  public frontCanvas: HTMLCanvasElement
  public backCanvas: HTMLCanvasElement
  public saveCanvas: HTMLCanvasElement
  public frontCtx: CanvasRenderingContext2D
  public backCtx: CanvasRenderingContext2D
  public saveCtx: CanvasRenderingContext2D
  public song: Song<ScoreNoteWithNoteInstance>
  public audio: MishiroAudio
  public pauseButton: HTMLButtonElement
  public saveButton: HTMLButtonElement
  public rangeInput: HTMLInputElement
  public speedInput: HTMLInputElement
  public progressTime: HTMLSpanElement
  public options: Option = {
    speed: 12 // * 60 px / s
  }

  private _isReady: boolean = false
  private _isReadyToSave: boolean = false
  private _isPaused: boolean = false
  private _t: number
  private _isClean = true
  private _comboDom: HTMLDivElement

  // private _preCalculation: { timeRange: number }

  constructor (song: Song<ScoreNote>, el: HTMLElement, options?: Option) {
    if (ScoreViewer._instance) return ScoreViewer._instance

    if (options) this.options = Object.assign({}, this.options, options)
    // this.audio = process.env.NODE_ENV === 'production' ? Global.createAudio(song.src) : Global.createAudio(relative(getPath('public'), song.src))
    this.audio = new MishiroAudio()
    this.audio.loop = false

    this.song = song
    // this._preCalculation = {
    //   timeRange: 24 * (60 / song.bpm)
    // }

    this._resolveNoteList()
    this._resolveDOM(el)
    // console.log(this.song.score)

    ScoreViewer._instance = this
    console.log('score hca: ' + song.src)
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.audio.playHca(song.src)
    return ScoreViewer._instance
  }

  private _setNoteInstance (index: number, note: Note): void {
    if (!this.song.score[index]._instance) this.song.score[index]._instance = note
  }

  private _resolveNoteList (): void {
    for (let i = 0; i < this.song.score.length; i++) {
      if (this.song.score[i]._instance) continue
      const note = this.song.score[i]

      switch (note.type) {
        case 1:
          if (note.status === 0) {
            this._setNoteInstance(i, new TapNote(note, this._getSyncNote(i)))
          } else {
            let group = this._findSameGroup(i, note.groupId)

            if (group.length) {
              for (let x = 0; x < group.length - 1; x++) {
                if (this.song.score[group[x]].finishPos === this.song.score[group[x + 1]].finishPos) {
                  group = group.slice(0, x + 1)
                  break
                }
              }
              for (let j = group.length - 1; j > 0; j--) {
                this._setNoteInstance(group[j], new FlipNote(this.song.score[group[j]], this.song.score[group[j - 1]], this._getSyncNote(group[j])))
              }
              this._setNoteInstance(group[0], new FlipNote(this.song.score[group[0]], note, this._getSyncNote(group[0])))
            }
            this._setNoteInstance(i, new FlipNote(note, undefined, this._getSyncNote(i)))
          }
          break
        case 2: {
          const endIndex = this._findLongNote(i, note.finishPos)
          if (endIndex !== -1) {
            const group = this._findSameGroup(endIndex, this.song.score[endIndex].groupId)
            if (group.length) {
              for (let j = group.length - 1; j > 0; j--) {
                if (this.song.score[group[j]].type === 2 && this.song.score[group[j]].status === 0) {
                  this._setNoteInstance(group[j], new LongNote(this.song.score[group[j]], this.song.score[group[j - 1]], this._getSyncNote(group[j])))
                } else {
                  this._setNoteInstance(group[j], new FlipNote(this.song.score[group[j]], this.song.score[group[j - 1]], this._getSyncNote(group[j])))
                }
              }
              if (this.song.score[group[0]].type === 2 && this.song.score[group[0]].status === 0) {
                this._setNoteInstance(group[0], new LongNote(this.song.score[group[0]], this.song.score[endIndex], this._getSyncNote(group[0])))
              } else {
                this._setNoteInstance(group[0], new FlipNote(this.song.score[group[0]], this.song.score[endIndex], this._getSyncNote(group[0])))
              }
            }
            if (this.song.score[endIndex].type === 2 && this.song.score[endIndex].status === 0) {
              this._setNoteInstance(endIndex, new LongNote(this.song.score[endIndex], note, this._getSyncNote(endIndex)))
            } else {
              this._setNoteInstance(endIndex, new FlipNote(this.song.score[endIndex], note, this._getSyncNote(endIndex)))
            }
          }
          this._setNoteInstance(i, new LongNote(note, undefined, this._getSyncNote(i)))
          break
        }
        case 3: {
          const group = this._findSameGroup(i, note.groupId)
          if (group.length) {
            for (let j = group.length - 1; j > 0; j--) {
              if (this.song.score[group[j]].type === 3 && this.song.score[group[j]].status === 0) {
                this._setNoteInstance(group[j], new LongMoveNote(this.song.score[group[j]], this.song.score[group[j - 1]], this._getSyncNote(group[j])))
              } else {
                this._setNoteInstance(group[j], new FlipNote(this.song.score[group[j]], this.song.score[group[j - 1]], this._getSyncNote(group[j])))
              }
            }
            if (this.song.score[group[0]].type === 3 && this.song.score[group[0]].status === 0) {
              this._setNoteInstance(group[0], new LongMoveNote(this.song.score[group[0]], note, this._getSyncNote(group[0])))
            } else {
              this._setNoteInstance(group[0], new FlipNote(this.song.score[group[0]], note, this._getSyncNote(group[0])))
            }
          }
          this._setNoteInstance(i, new LongMoveNote(note, undefined, this._getSyncNote(i)))
          break
        }
        default:
          break
      }
    }
  }

  public start (): void {
    if (!this._isReady) {
      setTimeout(() => {
        this.start()
      }, 100)
      return
    }

    this.audio.play().catch(err => {
      console.error(err)
      error(`SCOREVIEWER start: ${err.stack}`)
    })

    const self = this

    _frame()

    function _frame (): void {
      self._cal()
      self._renderNote()
      self._t = window.requestAnimationFrame(_frame)
    }
  }

  public stop (): void {
    this.audio.pause()
    window.cancelAnimationFrame(this._t)
  }

  private _clear (): void {
    if (!this._isClean) {
      this.frontCtx.clearRect(0, 0, ScoreViewer.CANVAS_WIDTH, ScoreViewer.CANVAS_HEIGHT - 15)
      this._isClean = true
    }
  }

  private _cal (): void {
    let combo = -1

    for (let i = 0; i < this.song.score.length; i++) {
      if (this.song.score[i].sec > this.audio.currentTime) {
        combo = i
        break
      }
      (this.song.score[i]._instance as Note).setY(ScoreViewer.calY(this.options.speed, this.song.score[i].sec, this.audio.currentTime))
    }

    if (combo === -1) combo = this.song.score.length
    if (this._comboDom.innerHTML !== combo.toString()) this._comboDom.innerHTML = combo.toString()

    for (let i = combo; i < this.song.score.length; i++) {
      (this.song.score[i]._instance as Note).setY(ScoreViewer.calY(this.options.speed, this.song.score[i].sec, this.audio.currentTime))
    }
  }

  private _findLongNote (begin: number, finishPos: number): number {
    for (let i = begin + 1; i < this.song.score.length; i++) {
      if (this.song.score[i].finishPos === finishPos) {
        return i
      }
    }
    return -1
  }

  private _findSameGroup (begin: number, groupId: number): number[] {
    if (groupId === 0) return []
    const index = []
    for (let i = begin + 1; i < this.song.score.length; i++) {
      if (this.song.score[i].groupId === groupId) {
        index.push(i)
      }
    }
    return index
  }

  private _renderNote (): void {
    this._clear()

    for (let i = this.song.score.length - 1; i >= 0; i--) {
      if ((this.song.score[i]._instance as Note).isNeedDraw()) (this.song.score[i]._instance as Note).drawConnection(this)
    }

    this.frontCtx.save()
    this.frontCtx.fillStyle = '#fff'
    for (let i = this.song.score.length - 1; i >= 0; i--) {
      if ((this.song.score[i]._instance as Note).isNeedDraw()) (this.song.score[i]._instance as Note).drawSync(this)
    }
    this.frontCtx.restore()

    for (let i = this.song.score.length - 1; i >= 0; i--) {
      if ((this.song.score[i]._instance as Note).isNeedDraw()) (this.song.score[i]._instance as Note).drawNote(this)
    }
    this._isClean = false
  }

  private _getSyncNote (index: number): ScoreNote | undefined {
    if (index !== this.song.score.length - 1 && this.song.score[index].sync === 1 && this.song.score[index].sec === this.song.score[index + 1].sec) {
      return this.song.score[index + 1]
    }
    return undefined
  }

  private _saveScore (): void {
    if (!this._isReady) {
      setTimeout(() => {
        this._saveScore()
      }, 100)
      return
    }

    const name = parse(this.song.src).name.substr(parse(this.song.src).name.indexOf('-') + 1)

    const _drawAndSave = (filename: string): void => {
      if (!this._isReadyToSave) {
        this.stop()
        this.saveCanvas.height = globalInstance.saveSpeed * 60 * this.audio.duration / globalInstance.scale
        this.saveCtx = this.saveCanvas.getContext('2d') as CanvasRenderingContext2D
        this.saveCtx.fillStyle = 'rgba(255, 255, 255, 0.66)'
        this.saveCtx.save()
        this.saveCtx.fillStyle = 'rgb(39, 40, 34)'
        this.saveCtx.font = '12px Consolas'
        this.saveCtx.fillRect(0, 0, this.saveCanvas.width, this.saveCanvas.height)
        this.saveCtx.strokeStyle = '#e070d0'
        this.saveCtx.fillStyle = '#e070d0'
        const b = Math.round(this.audio.duration * this.song.bpm / 60)
        for (let i = 0; i < b; i += 4) {
          const y = this.saveCanvas.height - (i * 60 / this.song.bpm * globalInstance.saveSpeed * 60) / globalInstance.scale + globalInstance.noteHeight / 2 / globalInstance.scale
          this.saveCtx.fillText(i.toString(), 1, y - 2)

          this.saveCtx.beginPath()
          this.saveCtx.moveTo(0, y)
          this.saveCtx.lineTo(this.saveCanvas.width, y)
          this.saveCtx.stroke()
          this.saveCtx.closePath()
        }
        const firstY = this.saveCanvas.height - (60 / this.song.bpm * globalInstance.saveSpeed * 60) / globalInstance.scale + globalInstance.noteHeight / 2 / globalInstance.scale
        this.saveCtx.font = '14px -apple-system, BlinkMacSystemFont, Segoe WPC,Segoe UI, HelveticaNeue-Light, Noto Sans, Microsoft YaHei, PingFang SC, Hiragino Sans GB, Source Han Sans SC, Source Han Sans CN, Source Han Sans, sans-serif'
        this.saveCtx.fillStyle = '#fff'
        this.saveCtx.textAlign = 'center'
        this.saveCtx.fillText('https://github.com/toyobayashi/mishiro', this.saveCanvas.width / 2, firstY - 7)
        this.saveCtx.fillText(name, this.saveCanvas.width / 2, firstY - 7 - 16 * 3)
        this.saveCtx.fillText(this.song.difficulty, this.saveCanvas.width / 2, firstY - 7 - 16 * 4)
        this.saveCtx.restore()
        globalInstance.noteWidth /= globalInstance.scale
        globalInstance.noteHeight /= globalInstance.scale
        globalInstance.noteWidthFlip /= globalInstance.scale

        const OLD_TOP_TO_TARGET_POSITION = ScoreViewer.TOP_TO_TARGET_POSITION
        const oldX = ScoreViewer.X
        ScoreViewer.X = [238 - 206, 414 - 206, 589 - 206, 764 - 206, 937 - 206].map(v => v / globalInstance.scale)
        ScoreViewer.TOP_TO_TARGET_POSITION = this.saveCanvas.height
        for (let i = 0; i < this.song.score.length; i++) {
          (this.song.score[i]._instance as Note).setX((this.song.score[i]._instance as Note).getX() / globalInstance.scale);
          (this.song.score[i]._instance as Note).setY(ScoreViewer.saveCalY(this, this.song.score[i].sec))
        }

        for (let i = this.song.score.length - 1; i >= 0; i--) {
          (this.song.score[i]._instance as Note).saveDrawConnection(this)
        }

        this.saveCtx.save()
        this.saveCtx.fillStyle = '#fff'
        for (let i = this.song.score.length - 1; i >= 0; i--) {
          (this.song.score[i]._instance as Note).saveDrawSync(this)
        }
        this.saveCtx.restore()

        for (let i = this.song.score.length - 1; i >= 0; i--) {
          (this.song.score[i]._instance as Note).saveDrawNote(this)
        }

        for (let i = 0; i < this.song.score.length; i++) {
          (this.song.score[i]._instance as Note).setX((this.song.score[i]._instance as Note).getX() * globalInstance.scale)
        }
        globalInstance.noteWidth *= globalInstance.scale
        globalInstance.noteHeight *= globalInstance.scale
        globalInstance.noteWidthFlip *= globalInstance.scale

        ScoreViewer.TOP_TO_TARGET_POSITION = OLD_TOP_TO_TARGET_POSITION
        ScoreViewer.X = oldX
      }

      const base64str = this.saveCanvas.toDataURL('image/png')
      if (base64str === 'data:,') {
        const OLD_SAVE_SPEED = globalInstance.saveSpeed
        globalInstance.saveSpeed--
        _drawAndSave(filename)
        globalInstance.saveSpeed = OLD_SAVE_SPEED
        return
      }

      this._isReadyToSave = true
      this.start()

      fs.writeFile(filename, Buffer.from(base64str.substr(22), 'base64'), (err) => {
        if (err) alert(err.message)
      })
    }

    showSaveDialog({
      title: 'Save Score - ' + name + '-' + this.song.difficulty,
      defaultPath: getPath.scoreDir(name + '-' + this.song.difficulty + '.png')
    }).then((res) => {
      res.filePath && _drawAndSave(res.filePath)
    }).catch((err) => {
      console.error(err)
      error(`SCOREVIEWER _saveScore: ${err.stack}`)
    })
  }

  private _formatTime (second: number): string {
    let min: string | number = Math.floor(second / 60)
    let sec: string | number = Math.floor(second % 60)
    if (min < 10) {
      min = `0${min}`
    }
    if (sec < 10) {
      sec = `0${sec}`
    }
    return `${min}:${sec}`
  }

  private _resolveDOM (el: HTMLElement): void {
    const background = document.getElementById('bg') as HTMLImageElement
    this.frontCanvas = document.createElement('canvas')
    this.backCanvas = document.createElement('canvas')
    this.saveCanvas = document.createElement('canvas')
    this.frontCanvas.width = this.backCanvas.width = ScoreViewer.CANVAS_WIDTH
    this.frontCanvas.height = this.backCanvas.height = ScoreViewer.CANVAS_HEIGHT

    this.saveCanvas.width = ScoreViewer.CANVAS_WIDTH / globalInstance.scale

    this.frontCanvas.className = this.backCanvas.className = 'canvas canvas-center'

    this.pauseButton = document.createElement('button')
    this.pauseButton.innerHTML = 'pause'
    this.pauseButton.addEventListener('click', () => {
      globalInstance.playSe()
      if (this._isPaused) {
        this.start()
      } else {
        this.stop()
      }
    })
    this.pauseButton.className = 'cgss-btn cgss-btn-star'
    this.pauseButton.style.position = 'absolute'
    this.pauseButton.style.zIndex = '2000'
    this.pauseButton.style.top = '2%'
    this.pauseButton.style.left = '1%'

    this.saveButton = document.createElement('button')
    this.saveButton.innerHTML = 'save'
    this.saveButton.addEventListener('click', () => {
      globalInstance.playSeOk()
      this._saveScore()
    })
    this.saveButton.className = 'cgss-btn cgss-btn-ok'
    this.saveButton.style.position = 'absolute'
    this.saveButton.style.zIndex = '2000'
    this.saveButton.style.top = 'calc(2% + 84px)'
    this.saveButton.style.left = '1%'

    this.rangeInput = document.createElement('input')
    this.rangeInput.type = 'range'
    this.rangeInput.min = '0'
    this.rangeInput.max = '100'
    this.rangeInput.value = '0'
    this.rangeInput.style.position = 'absolute'
    this.rangeInput.style.zIndex = '2000'
    this.rangeInput.style.width = '50%'
    this.rangeInput.style.left = '25%'
    this.rangeInput.style.bottom = '10px'
    this.rangeInput.addEventListener('input', (ev) => {
      this.audio.currentTime = Number((ev.target as HTMLInputElement).value)
      this.progressTime.innerHTML = `${this._formatTime(Number((ev.target as HTMLInputElement).value))} / ${this._formatTime(this.audio.duration)}`
    })

    this.speedInput = document.createElement('input')
    this.speedInput.type = 'range'
    this.speedInput.min = '5'
    this.speedInput.max = '20'
    this.speedInput.value = '12'
    this.speedInput.style.position = 'absolute'
    this.speedInput.style.zIndex = '2000'
    this.speedInput.style.width = '15%'
    this.speedInput.style.left = '2%'
    this.speedInput.style.bottom = '10px'
    this.speedInput.addEventListener('input', (ev) => {
      this.options.speed = Number((ev.target as HTMLInputElement).value)
    })

    this.progressTime = document.createElement('span')
    this.progressTime.innerHTML = '00:00 / 00:00'
    this.progressTime.style.position = 'absolute'
    this.progressTime.style.zIndex = '2000'
    this.progressTime.style.width = '15%'
    this.progressTime.style.right = '2%'
    this.progressTime.style.bottom = '2px'
    this.progressTime.style.color = '#fff'
    this.progressTime.style.fontFamily = 'CGSS-B'

    el.appendChild(this.backCanvas)
    el.appendChild(this.frontCanvas)
    el.appendChild(this.pauseButton)
    el.appendChild(this.saveButton)
    el.appendChild(this.rangeInput)
    el.appendChild(this.speedInput)
    el.appendChild(this.progressTime)
    this._comboDom = document.getElementById('combo') as HTMLDivElement

    this.frontCtx = this.frontCanvas.getContext('2d') as CanvasRenderingContext2D
    this.backCtx = this.backCanvas.getContext('2d') as CanvasRenderingContext2D
    this.frontCtx.fillStyle = 'rgba(255, 255, 255, 0.66)'

    const liveIcon = Global.newImage('../../asset/img.asar/live_icon_857x114.png')
    liveIcon.addEventListener('load', () => {
      this.backCtx.drawImage(liveIcon, 5, ScoreViewer.CANVAS_HEIGHT - ScoreViewer.BOTTOM - 114)
    }, false)

    this.audio.on('canplay', () => {
      this._isReady = true
      this.rangeInput.max = this.audio.duration.toString()
    })

    this.audio.on('play', () => {
      this._isPaused = false
      this.pauseButton.innerHTML = 'pause'
      this.pauseButton.className = 'cgss-btn cgss-btn-star'
    })

    this.audio.on('pause', () => {
      this._isPaused = true
      this.pauseButton.innerHTML = 'play'
      this.pauseButton.className = 'cgss-btn cgss-btn-ok'
    })

    this.audio.on('ended', () => {
      window.close()
    })

    this.audio.on('timeupdate', () => {
      this.rangeInput.value = this.audio.currentTime.toString()
      this.progressTime.innerHTML = `${this._formatTime(this.audio.currentTime)} / ${this._formatTime(this.audio.duration)}`
      this.rangeInput.style.backgroundSize = `${100 * (this.audio.currentTime / this.audio.duration)}% 100%`
    })

    window.addEventListener('resize', () => {
      if (window.innerWidth / window.innerHeight >= 1280 / 824) {
        background.className = 'img-middle'
      } else {
        background.className = 'img-center'
      }
      if (window.innerWidth / window.innerHeight >= ScoreViewer.CANVAS_WIDTH / ScoreViewer.CANVAS_HEIGHT) {
        this.frontCanvas.className = 'canvas canvas-center'
        if (this.backCanvas) this.backCanvas.className = 'canvas canvas-center'
      } else {
        this.frontCanvas.className = 'canvas canvas-middle'
        if (this.backCanvas) this.backCanvas.className = 'canvas canvas-middle'
      }
    }, false)
  }
}

export default ScoreViewer
