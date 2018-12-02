import '../css/mishiro.css'
import '../css/game.css'
import { ipcRenderer, remote } from 'electron'
import { parse, relative } from 'path'
import { ScoreNote } from './main/on-score'
import getPath from './renderer/get-path'
import { writeFile } from 'fs-extra'

let NOTE_WIDTH = 102
let NOTE_HEIGHT = 102
let NOTE_WIDTH_FLIP = 125
let NOTE_WIDTH_DELTA = NOTE_WIDTH_FLIP - NOTE_WIDTH
let NOTE_WIDTH_HALF = NOTE_WIDTH / 2
let NOTE_HEIGHT_HALF = NOTE_HEIGHT / 2

let SCALE = 3
let SAVE_SPEED = 12

const tapCanvas = document.createElement('canvas')
const longLoopCanvas = document.createElement('canvas')
const longMoveCanvas = document.createElement('canvas')
const longMoveWhiteCanvas = document.createElement('canvas')
const flipLeftCanvas = document.createElement('canvas')
const flipRightCanvas = document.createElement('canvas')
tapCanvas.width = longLoopCanvas.width = longMoveCanvas.width = longMoveWhiteCanvas.width = tapCanvas.height = longLoopCanvas.height = longMoveCanvas.height = longMoveWhiteCanvas.height = flipLeftCanvas.height = flipRightCanvas.height = NOTE_WIDTH
flipLeftCanvas.width = flipRightCanvas.width = NOTE_WIDTH_FLIP

const iconNotesImg = newImage('../../asset/img.asar/icon_notes.png')
iconNotesImg.addEventListener('load', () => {
  (tapCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, 0, 0, NOTE_WIDTH, NOTE_HEIGHT, 0, 0, NOTE_WIDTH, NOTE_HEIGHT);
  (longLoopCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, NOTE_WIDTH, 0, NOTE_WIDTH, NOTE_HEIGHT, 0, 0, NOTE_WIDTH, NOTE_HEIGHT);
  (longMoveCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, NOTE_WIDTH * 2, 0, NOTE_WIDTH, NOTE_HEIGHT, 0, 0, NOTE_WIDTH, NOTE_HEIGHT);
  (longMoveWhiteCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, NOTE_WIDTH * 3, 0, NOTE_WIDTH, NOTE_HEIGHT, 0, 0, NOTE_WIDTH, NOTE_HEIGHT);
  (flipLeftCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, NOTE_WIDTH * 4, 0, NOTE_WIDTH_FLIP, NOTE_HEIGHT, 0, 0, NOTE_WIDTH_FLIP, NOTE_HEIGHT);
  (flipRightCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, NOTE_WIDTH * 4 + NOTE_WIDTH_FLIP, 0, NOTE_WIDTH_FLIP, NOTE_HEIGHT, 0, 0, NOTE_WIDTH_FLIP, NOTE_HEIGHT)
})

const background = document.getElementById('bg') as HTMLImageElement

window.addEventListener('resize', () => {
  const isYoko = (window.innerWidth / window.innerHeight >= 1280 / 824)
  if (isYoko) {
    background.className = 'img-middle'
  } else {
    background.className = 'img-center'
  }
}, false)

const se = createAudio('../../asset/se.asar/se_common_cancel.mp3')
const seOk = createAudio('../../asset/se.asar/se_common_enter.mp3')

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

interface ScoreNoteWithNoteInstance extends ScoreNote {
  _instance?: Note
}

class ScoreViewer {

  private static _instance: ScoreViewer | null = null
  public static init (song: Song<ScoreNote>, el: HTMLElement, options?: Option) {
    return new ScoreViewer(song, el, options)
  }

  public static calY (speed: number, sec: number, currentTime: number): number {
    return ScoreViewer.TOP_TO_TARGET_POSITION - (~~(speed * 60 * (sec - currentTime)))
  }

  public static saveCalY (sv: ScoreViewer, sec: number): number {
    return sv.saveCanvas.height - ((~~(SAVE_SPEED * 60 * (sec)))) / SCALE
  }

  private static CANVAS_WIDTH = 867
  private static CANVAS_HEIGHT = 720
  public static X: number[] = [238 - 206, 414 - 206, 589 - 206, 764 - 206, 937 - 206]
  private static BOTTOM = 20
  public static TOP_TO_TARGET_POSITION = ScoreViewer.CANVAS_HEIGHT - ScoreViewer.BOTTOM - 114 + 6

  public frontCanvas: HTMLCanvasElement
  public backCanvas: HTMLCanvasElement
  public saveCanvas: HTMLCanvasElement
  public frontCtx: CanvasRenderingContext2D
  public backCtx: CanvasRenderingContext2D
  public saveCtx: CanvasRenderingContext2D
  public song: Song<ScoreNoteWithNoteInstance>
  public audio: HTMLAudioElement
  public pauseButton: HTMLButtonElement
  public saveButton: HTMLButtonElement
  public rangeInput: HTMLInputElement
  public speedInput: HTMLInputElement
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
    this.audio = process.env.NODE_ENV === 'production' ? createAudio(song.src) : createAudio(relative(__dirname, song.src))

    this.song = song
    // this._preCalculation = {
    //   timeRange: 24 * (60 / song.bpm)
    // }

    this._resolveNoteList()
    this._resolveDOM(el)
    // console.log(this.song.score)

    ScoreViewer._instance = this
    return ScoreViewer._instance
  }

  private _setNoteInstance (index: number, note: Note) {
    if (!this.song.score[index]._instance) this.song.score[index]._instance = note
  }

  private _resolveNoteList () {
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
        case 2:
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
            this._setNoteInstance(endIndex, new FlipNote(this.song.score[endIndex], note, this._getSyncNote(endIndex)))
          }
          this._setNoteInstance(i, new LongNote(note, undefined, this._getSyncNote(i)))
          break
        case 3:
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
        default:
          break
      }
    }
  }

  public start () {
    if (!this._isReady) {
      setTimeout(() => {
        this.start()
      }, 100)
      return
    }

    this.audio.play().catch(err => console.log(err))

    const self = this

    _frame()

    function _frame () {
      self._cal()
      self._renderNote()
      self._t = window.requestAnimationFrame(_frame)
    }
  }

  public stop () {
    this.audio.pause()
    window.cancelAnimationFrame(this._t)
  }

  private _clear () {
    if (!this._isClean) {
      this.frontCtx.clearRect(0, 0, ScoreViewer.CANVAS_WIDTH, ScoreViewer.CANVAS_HEIGHT - 15)
      this._isClean = true
    }
  }

  private _cal () {
    let combo = -1

    for (let i = 0; i < this.song.score.length; i++) {
      if (this.song.score[i].sec > this.audio.currentTime) {
        combo = i
        break
      }
      (this.song.score[i]._instance as Note).setY(ScoreViewer.calY(this.options.speed, this.song.score[i].sec, this.audio.currentTime))
    }

    if (combo === -1) combo = this.song.score.length
    if (this._comboDom.innerHTML !== '' + combo) this._comboDom.innerHTML = '' + combo

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

  private _renderNote () {

    this._clear()
    for (let i = this.song.score.length - 1; i >= 0; i--) {
      (this.song.score[i]._instance as Note).draw(this)
    }
    this._isClean = false
  }

  private _getSyncNote (index: number): ScoreNote | undefined {
    if (index !== this.song.score.length - 1 && this.song.score[index].sync === 1 && this.song.score[index].sec === this.song.score[index + 1].sec) {
      return this.song.score[index + 1]
    }
    return undefined
  }

  private _saveScore () {
    if (!this._isReady) {
      setTimeout(() => {
        this._saveScore()
      }, 100)
      return
    }

    let name = parse(this.song.src).name.substr(parse(this.song.src).name.indexOf('-') + 1)

    const _drawAndSave = (filename: string) => {
      if (!this._isReadyToSave) {
        this.stop()
        this.saveCanvas.height = SAVE_SPEED * 60 * this.audio.duration / SCALE
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
          const y = this.saveCanvas.height - ((i * 60 / this.song.bpm * SAVE_SPEED * 60)) / SCALE - (60 / this.song.bpm * SAVE_SPEED * 60) / 2 / SCALE + 102 / 2 / SCALE
          this.saveCtx.fillText('' + i, 1, y - 2)

          this.saveCtx.beginPath()
          this.saveCtx.moveTo(0, y)
          this.saveCtx.lineTo(this.saveCanvas.width, y)
          this.saveCtx.stroke()
          this.saveCtx.closePath()
        }
        const firstY = this.saveCanvas.height - (60 / this.song.bpm * SAVE_SPEED * 60) / 2 / SCALE + 102 / 2 / SCALE
        this.saveCtx.font = '14px -apple-system, BlinkMacSystemFont, Segoe WPC,Segoe UI, HelveticaNeue-Light, Noto Sans, Microsoft YaHei, PingFang SC, Hiragino Sans GB, Source Han Sans SC, Source Han Sans CN, Source Han Sans, sans-serif'
        this.saveCtx.fillStyle = '#fff'
        this.saveCtx.textAlign = 'center'
        this.saveCtx.fillText('https://github.com/toyobayashi/mishiro', this.saveCanvas.width / 2, firstY - 7)
        this.saveCtx.fillText(name, this.saveCanvas.width / 2, firstY - 7 - 16 * 3)
        this.saveCtx.fillText(this.song.difficulty, this.saveCanvas.width / 2, firstY - 7 - 16 * 4)
        this.saveCtx.restore()
        NOTE_WIDTH = 102 / SCALE
        NOTE_HEIGHT = 102 / SCALE
        NOTE_WIDTH_FLIP = 125 / SCALE
        NOTE_WIDTH_DELTA = NOTE_WIDTH_FLIP - NOTE_WIDTH
        NOTE_WIDTH_HALF = NOTE_WIDTH / 2
        NOTE_HEIGHT_HALF = NOTE_HEIGHT / 2
        const OLD_TOP_TO_TARGET_POSITION = ScoreViewer.TOP_TO_TARGET_POSITION
        const oldX = ScoreViewer.X
        ScoreViewer.X = [238 - 206, 414 - 206, 589 - 206, 764 - 206, 937 - 206].map(v => v / SCALE)
        ScoreViewer.TOP_TO_TARGET_POSITION = this.saveCanvas.height
        for (let i = 0; i < this.song.score.length; i++) {
          (this.song.score[i]._instance as Note).setX((this.song.score[i]._instance as Note).getX() / SCALE);
          (this.song.score[i]._instance as Note).setY(ScoreViewer.saveCalY(this, this.song.score[i].sec))
        }
        for (let i = this.song.score.length - 1; i >= 0; i--) {
          (this.song.score[i]._instance as Note).saveDraw(this)
        }

        for (let i = 0; i < this.song.score.length; i++) {
          (this.song.score[i]._instance as Note).setX((this.song.score[i]._instance as Note).getX() * SCALE)
        }
        NOTE_WIDTH = 102
        NOTE_HEIGHT = 102
        NOTE_WIDTH_FLIP = 125
        NOTE_WIDTH_DELTA = NOTE_WIDTH_FLIP - NOTE_WIDTH
        NOTE_WIDTH_HALF = NOTE_WIDTH / 2
        NOTE_HEIGHT_HALF = NOTE_HEIGHT / 2
        ScoreViewer.TOP_TO_TARGET_POSITION = OLD_TOP_TO_TARGET_POSITION
        ScoreViewer.X = oldX

      }

      const base64str = this.saveCanvas.toDataURL('image/png')
      if (base64str === 'data:,') {
        const OLD_SAVE_SPEED = SAVE_SPEED
        SAVE_SPEED--
        _drawAndSave(filename)
        SAVE_SPEED = OLD_SAVE_SPEED
        return
      }

      this._isReadyToSave = true
      this.start()

      writeFile(filename, Buffer.from(base64str.substr(22), 'base64'), (err) => {
        if (err) alert(err.message)
      })
    }

    remote.dialog.showSaveDialog({
      title: 'Save Score - ' + name + '-' + this.song.difficulty,
      defaultPath: getPath.scoreDir(name + '-' + this.song.difficulty + '.png')
    }, _drawAndSave)
  }

  private _resolveDOM (el: HTMLElement) {
    this.frontCanvas = document.createElement('canvas')
    this.backCanvas = document.createElement('canvas')
    this.saveCanvas = document.createElement('canvas')
    this.frontCanvas.width = this.backCanvas.width = ScoreViewer.CANVAS_WIDTH
    this.frontCanvas.height = this.backCanvas.height = ScoreViewer.CANVAS_HEIGHT

    this.saveCanvas.width = ScoreViewer.CANVAS_WIDTH / SCALE

    this.frontCanvas.className = this.backCanvas.className = 'canvas canvas-center'

    this.pauseButton = document.createElement('button')
    this.pauseButton.innerHTML = 'pause'
    this.pauseButton.addEventListener('click', () => {
      se.play().catch(err => console.log(err))
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
      seOk.play().catch(err => console.log(err))
      this._saveScore()
      // se.play().catch(err => console.log(err))
      // if (this._isPaused) {
      //   this.start()
      // } else {
      //   this.stop()
      // }
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

    el.appendChild(this.backCanvas)
    el.appendChild(this.frontCanvas)
    el.appendChild(this.pauseButton)
    el.appendChild(this.saveButton)
    el.appendChild(this.rangeInput)
    el.appendChild(this.speedInput)
    this._comboDom = document.getElementById('combo') as HTMLDivElement

    this.frontCtx = this.frontCanvas.getContext('2d') as CanvasRenderingContext2D
    this.backCtx = this.backCanvas.getContext('2d') as CanvasRenderingContext2D
    this.frontCtx.fillStyle = 'rgba(255, 255, 255, 0.66)'

    const liveIcon = newImage('../../asset/img.asar/live_icon_857x114.png')
    liveIcon.addEventListener('load', () => {
      this.backCtx.drawImage(liveIcon, 5, ScoreViewer.CANVAS_HEIGHT - ScoreViewer.BOTTOM - 114)
    }, false)

    this.audio.addEventListener('canplay', () => {
      this._isReady = true
      this.rangeInput.max = this.audio.duration.toString()
    })

    this.audio.addEventListener('play', () => {
      this._isPaused = false
      this.pauseButton.innerHTML = 'pause'
      this.pauseButton.className = 'cgss-btn cgss-btn-star'
    })

    this.audio.addEventListener('pause', () => {
      this._isPaused = true
      this.pauseButton.innerHTML = 'play'
      this.pauseButton.className = 'cgss-btn cgss-btn-ok'
    })

    this.audio.addEventListener('ended', () => {
      window.close()
    }, false)

    this.audio.addEventListener('timeupdate', () => {
      this.rangeInput.value = this.audio.currentTime.toString()
      this.rangeInput.style.backgroundSize = 100 * (this.audio.currentTime / this.audio.duration) + '% 100%'
    })
  }
}

abstract class Note {
  protected _sec: number
  protected _x: number
  protected _y: number
  protected _connection: ScoreNoteWithNoteInstance | null
  protected _synchronizedNote: ScoreNoteWithNoteInstance | null
  private _connectionHeight = 10

  constructor (note: ScoreNote) {
    this._sec = note.sec
    this._x = ScoreViewer.X[note.finishPos - 1]
    this._y = -NOTE_HEIGHT
    this._connection = null
    this._synchronizedNote = null
  }

  public setY (y: number) {
    this._y = y
  }

  public getX () {
    return this._x
  }

  public setX (x: number) {
    this._x = x
  }

  protected _saveDrawSync (sv: ScoreViewer) {
    if (!this._synchronizedNote) return

    const syncX = ScoreViewer.X[this._synchronizedNote.finishPos - 1] + NOTE_WIDTH_HALF
    const syncY = ScoreViewer.saveCalY(sv, this._sec) + NOTE_HEIGHT_HALF - this._connectionHeight / 2 / SCALE
    const selfX = this._x + NOTE_WIDTH_HALF
    sv.saveCtx.save()
    sv.saveCtx.fillStyle = '#fff'
    sv.saveCtx.fillRect((selfX < syncX ? selfX : syncX) + NOTE_WIDTH_HALF, syncY, (selfX < syncX ? syncX - selfX : selfX - syncX) - NOTE_WIDTH, this._connectionHeight / SCALE)
    sv.saveCtx.restore()
  }

  protected _drawSync (sv: ScoreViewer) {
    if (!this._synchronizedNote) return

    const syncX = ScoreViewer.X[this._synchronizedNote.finishPos - 1] + NOTE_WIDTH_HALF
    const syncY = ScoreViewer.calY(sv.options.speed, this._sec, sv.audio.currentTime) + NOTE_HEIGHT_HALF - this._connectionHeight / 2
    const selfX = this._x + NOTE_WIDTH_HALF
    sv.frontCtx.save()
    sv.frontCtx.fillStyle = '#fff'
    sv.frontCtx.fillRect((selfX < syncX ? selfX : syncX) + NOTE_WIDTH_HALF, syncY, (selfX < syncX ? syncX - selfX : selfX - syncX) - NOTE_WIDTH, this._connectionHeight)
    sv.frontCtx.restore()
  }

  protected _isNeedDraw (): boolean {
    if (this._y < -NOTE_HEIGHT) {
      if (!this._connection) return false
      return (this._connection._instance as Note)._y >= -NOTE_HEIGHT
    }
    return this._y < ScoreViewer.TOP_TO_TARGET_POSITION
  }

  public abstract saveDraw (sv: ScoreViewer): void
  public abstract draw (sv: ScoreViewer): void
}

class TapNote extends Note {
  constructor (note: ScoreNote, syncNote?: ScoreNote) {
    super(note)
    if (syncNote) this._synchronizedNote = syncNote
  }

  public draw (sv: ScoreViewer) {
    if (!this._isNeedDraw()) return

    this._drawSync(sv)
    sv.frontCtx.drawImage(tapCanvas, this._x, this._y)
  }

  public saveDraw (sv: ScoreViewer) {
    this._saveDrawSync(sv)
    sv.saveCtx.drawImage(tapCanvas, 0, 0, tapCanvas.width, tapCanvas.height, this._x, this._y, tapCanvas.width / SCALE, tapCanvas.height / SCALE/* ScoreViewer.calY(sv.options.speed, this._sec, 0) */)
  }
}

class FlipNote extends Note {
  private _status: number
  constructor (note: ScoreNote, connectionNote?: ScoreNote, syncNote?: ScoreNote) {
    super(note)
    this._status = note.status
    if (this._status === 1) {
      this._x = this._x - NOTE_WIDTH_DELTA
    }
    if (connectionNote) {
      this._connection = connectionNote
    }
    if (syncNote) {
      this._synchronizedNote = syncNote
    }
  }

  private _drawFlipConnection (ctx: CanvasRenderingContext2D, connectionX: number, connectionY: number) {
    if (connectionY >= ScoreViewer.TOP_TO_TARGET_POSITION) return
    const xCenter = this._status === 1 ? this._x + NOTE_WIDTH_DELTA + NOTE_WIDTH_HALF : this._x + NOTE_WIDTH_HALF
    ctx.beginPath()
    ctx.moveTo(xCenter, this._y)
    ctx.lineTo(xCenter, this._y + NOTE_HEIGHT)
    ctx.lineTo(connectionX + NOTE_WIDTH_HALF, connectionY + NOTE_HEIGHT)
    ctx.lineTo(connectionX + NOTE_WIDTH_HALF, connectionY)
    ctx.lineTo(xCenter, this._y)
    ctx.fill()
  }

  private _drawLongConnection (ctx: CanvasRenderingContext2D, connectionY: number) {
    const x = this._status === 1 ? this._x + NOTE_WIDTH_DELTA : this._x
    ctx.beginPath()
    ctx.arc(x + NOTE_WIDTH_HALF, this._y + NOTE_HEIGHT_HALF, NOTE_WIDTH_HALF, 0, Math.PI, true)
    const targetY = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? ScoreViewer.TOP_TO_TARGET_POSITION + NOTE_HEIGHT_HALF : connectionY + NOTE_HEIGHT_HALF
    ctx.lineTo(x, targetY)
    ctx.arc(x + NOTE_WIDTH_HALF, targetY, NOTE_WIDTH_HALF, Math.PI, 2 * Math.PI, true)
    ctx.lineTo(x + NOTE_WIDTH, this._y + NOTE_HEIGHT_HALF)
    ctx.fill()
  }

  private _drawMoveConnection (ctx: CanvasRenderingContext2D, connectionX: number, connectionY: number, SCALE?: number) {
    ctx.beginPath()
    ctx.arc(this._status === 1 ? this._x + NOTE_WIDTH_HALF + NOTE_WIDTH_DELTA : this._x + NOTE_WIDTH_HALF, this._y + NOTE_HEIGHT_HALF, NOTE_WIDTH_HALF, 0, Math.PI, true)
    const targetY = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? ScoreViewer.TOP_TO_TARGET_POSITION + NOTE_HEIGHT_HALF : connectionY + NOTE_HEIGHT_HALF
    const targetX = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? connectionX + ((this._x - connectionX) * (-(ScoreViewer.TOP_TO_TARGET_POSITION - connectionY)) / ((-(ScoreViewer.TOP_TO_TARGET_POSITION - connectionY)) + (ScoreViewer.TOP_TO_TARGET_POSITION - this._y))) : connectionX
    ctx.lineTo(targetX, targetY)
    ctx.arc(targetX + NOTE_WIDTH_HALF, targetY, NOTE_WIDTH_HALF, Math.PI, 2 * Math.PI, true)
    ctx.lineTo(this._status === 1 ? this._x + NOTE_WIDTH + NOTE_WIDTH_DELTA : this._x + NOTE_WIDTH, this._y + NOTE_HEIGHT_HALF)
    ctx.fill()
    if (connectionY > ScoreViewer.TOP_TO_TARGET_POSITION) {
      if (!SCALE) ctx.drawImage(longMoveWhiteCanvas, targetX, targetY - NOTE_HEIGHT_HALF)
      else ctx.drawImage(longMoveWhiteCanvas, 0, 0, longMoveWhiteCanvas.width, longMoveWhiteCanvas.height, targetX, targetY - NOTE_HEIGHT_HALF, longMoveWhiteCanvas.width / SCALE, longMoveWhiteCanvas.height / SCALE)
    }
  }

  public draw (sv: ScoreViewer) {
    if (!this._isNeedDraw()) return

    this._drawSync(sv)
    if (this._connection) {
      const connectionX = ScoreViewer.X[this._connection.finishPos - 1]
      const connectionY = ScoreViewer.calY(sv.options.speed, this._connection.sec, sv.audio.currentTime)
      if (this._connection.type === 1) {
        this._drawFlipConnection(sv.frontCtx, connectionX, connectionY)
      } else if (this._connection.type === 2) {
        if (this._connection.status === 0) {
          this._drawLongConnection(sv.frontCtx, connectionY)
        } else {
          this._drawFlipConnection(sv.frontCtx, connectionX, connectionY)
        }
      } else if (this._connection.type === 3) {
        if (this._connection.status === 0) {
          this._drawMoveConnection(sv.frontCtx, connectionX, connectionY)
        } else {
          this._drawFlipConnection(sv.frontCtx, connectionX, connectionY)
        }
      }
    }
    sv.frontCtx.drawImage(this._status === 1 ? flipLeftCanvas : flipRightCanvas, this._x, this._y)
  }

  public saveDraw (sv: ScoreViewer) {
    this._saveDrawSync(sv)
    if (this._connection) {
      const connectionX = ScoreViewer.X[this._connection.finishPos - 1]
      const connectionY = ScoreViewer.saveCalY(sv, this._connection.sec)
      if (this._connection.type === 1) {
        this._drawFlipConnection(sv.saveCtx, connectionX, connectionY)
      } else if (this._connection.type === 2) {
        if (this._connection.status === 0) {
          this._drawLongConnection(sv.saveCtx, connectionY)
        } else {
          this._drawFlipConnection(sv.saveCtx, connectionX, connectionY)
        }
      } else if (this._connection.type === 3) {
        if (this._connection.status === 0) {
          this._drawMoveConnection(sv.saveCtx, connectionX, connectionY, SCALE)
        } else {
          this._drawFlipConnection(sv.saveCtx, connectionX, connectionY)
        }
      }
    }

    if (this._status === 1) {
      sv.saveCtx.drawImage(flipLeftCanvas, 0, 0, flipLeftCanvas.width, flipLeftCanvas.height, this._x, this._y, flipLeftCanvas.width / SCALE, flipLeftCanvas.height / SCALE)
    } else {
      sv.saveCtx.drawImage(flipRightCanvas, 0, 0, flipRightCanvas.width, flipRightCanvas.height, this._x, this._y, flipRightCanvas.width / SCALE, flipRightCanvas.height / SCALE)
    }
  }
}

class LongNote extends Note {
  constructor (note: ScoreNote, connectionNote?: ScoreNote, syncNote?: ScoreNote) {
    super(note)

    if (connectionNote) {
      this._connection = connectionNote
    }
    if (syncNote) {
      this._synchronizedNote = syncNote
    }
  }

  public draw (sv: ScoreViewer) {
    if (!this._isNeedDraw()) return

    this._drawSync(sv)
    if (this._connection) {
      const connectionY = ScoreViewer.calY(sv.options.speed, this._connection.sec, sv.audio.currentTime)
      sv.frontCtx.beginPath()
      sv.frontCtx.arc(this._x + NOTE_WIDTH_HALF, this._y + NOTE_HEIGHT_HALF, NOTE_WIDTH_HALF, 0, Math.PI, true)
      const targetY = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? ScoreViewer.TOP_TO_TARGET_POSITION + NOTE_HEIGHT_HALF : connectionY + NOTE_HEIGHT_HALF
      sv.frontCtx.lineTo(this._x, targetY)
      sv.frontCtx.arc(this._x + NOTE_WIDTH_HALF, targetY, NOTE_WIDTH_HALF, Math.PI, 2 * Math.PI, true)
      sv.frontCtx.lineTo(this._x + NOTE_WIDTH, this._y + NOTE_HEIGHT_HALF)
      sv.frontCtx.fill()
    }
    sv.frontCtx.drawImage(longLoopCanvas, this._x, this._y)
  }

  public saveDraw (sv: ScoreViewer) {
    this._saveDrawSync(sv)
    if (this._connection) {
      const connectionY = ScoreViewer.saveCalY(sv, this._connection.sec)
      sv.saveCtx.beginPath()
      sv.saveCtx.arc(this._x + NOTE_WIDTH_HALF, this._y + NOTE_HEIGHT_HALF, NOTE_WIDTH_HALF, 0, Math.PI, true)
      const targetY = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? ScoreViewer.TOP_TO_TARGET_POSITION + NOTE_HEIGHT_HALF : connectionY + NOTE_HEIGHT_HALF
      sv.saveCtx.lineTo(this._x, targetY)
      sv.saveCtx.arc(this._x + NOTE_WIDTH_HALF, targetY, NOTE_WIDTH_HALF, Math.PI, 2 * Math.PI, true)
      sv.saveCtx.lineTo(this._x + NOTE_WIDTH, this._y + NOTE_HEIGHT_HALF)
      sv.saveCtx.fill()
    }
    // sv.saveCtx.drawImage(longLoopCanvas, this._x, this._y)
    sv.saveCtx.drawImage(longLoopCanvas, 0, 0, longLoopCanvas.width, longLoopCanvas.height, this._x, this._y, longLoopCanvas.width / SCALE, longLoopCanvas.height / SCALE)

  }
}

class LongMoveNote extends Note {
  constructor (note: ScoreNote, connectionNote?: ScoreNote, syncNote?: ScoreNote) {
    super(note)

    if (connectionNote) {
      this._connection = connectionNote
    }
    if (syncNote) {
      this._synchronizedNote = syncNote
    }
  }

  public draw (sv: ScoreViewer) {
    if (!this._isNeedDraw()) return

    this._drawSync(sv)
    if (this._connection) {
      const connectionX = ScoreViewer.X[this._connection.finishPos - 1]
      const connectionY = ScoreViewer.calY(sv.options.speed, this._connection.sec, sv.audio.currentTime)
      sv.frontCtx.beginPath()
      sv.frontCtx.arc(this._x + NOTE_WIDTH_HALF, this._y + NOTE_HEIGHT_HALF, NOTE_WIDTH_HALF, 0, Math.PI, true)
      const targetY = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? ScoreViewer.TOP_TO_TARGET_POSITION + NOTE_HEIGHT_HALF : connectionY + NOTE_HEIGHT_HALF
      const targetX = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? connectionX + ((this._x - connectionX) * (-(ScoreViewer.TOP_TO_TARGET_POSITION - connectionY)) / ((-(ScoreViewer.TOP_TO_TARGET_POSITION - connectionY)) + (ScoreViewer.TOP_TO_TARGET_POSITION - this._y))) : connectionX
      sv.frontCtx.lineTo(targetX, targetY)
      sv.frontCtx.arc(targetX + NOTE_WIDTH_HALF, targetY, NOTE_WIDTH_HALF, Math.PI, 2 * Math.PI, true)
      sv.frontCtx.lineTo(this._x + NOTE_WIDTH, this._y + NOTE_HEIGHT_HALF)
      sv.frontCtx.fill()
      if (connectionY > ScoreViewer.TOP_TO_TARGET_POSITION) sv.frontCtx.drawImage(longMoveWhiteCanvas, targetX, targetY - NOTE_HEIGHT_HALF)
    }
    sv.frontCtx.drawImage(longMoveCanvas, this._x, this._y)
  }

  public saveDraw (sv: ScoreViewer) {
    this._saveDrawSync(sv)
    if (this._connection) {
      const connectionX = ScoreViewer.X[this._connection.finishPos - 1]
      const connectionY = ScoreViewer.saveCalY(sv, this._connection.sec)
      sv.saveCtx.beginPath()
      sv.saveCtx.arc(this._x + NOTE_WIDTH_HALF, this._y + NOTE_HEIGHT_HALF, NOTE_WIDTH_HALF, 0, Math.PI, true)
      const targetY = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? ScoreViewer.TOP_TO_TARGET_POSITION + NOTE_HEIGHT_HALF : connectionY + NOTE_HEIGHT_HALF
      const targetX = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? connectionX + ((this._x - connectionX) * (-(ScoreViewer.TOP_TO_TARGET_POSITION - connectionY)) / ((-(ScoreViewer.TOP_TO_TARGET_POSITION - connectionY)) + (ScoreViewer.TOP_TO_TARGET_POSITION - this._y))) : connectionX
      sv.saveCtx.lineTo(targetX, targetY)
      sv.saveCtx.arc(targetX + NOTE_WIDTH_HALF, targetY, NOTE_WIDTH_HALF, Math.PI, 2 * Math.PI, true)
      sv.saveCtx.lineTo(this._x + NOTE_WIDTH, this._y + NOTE_HEIGHT_HALF)
      sv.saveCtx.fill()
      if (connectionY > ScoreViewer.TOP_TO_TARGET_POSITION) sv.saveCtx.drawImage(longMoveWhiteCanvas, 0, 0, longMoveWhiteCanvas.width, longMoveWhiteCanvas.height, targetX, targetY - NOTE_HEIGHT_HALF, longMoveWhiteCanvas.width / SCALE, longMoveWhiteCanvas.height / SCALE)
    }
    sv.saveCtx.drawImage(longMoveCanvas, 0, 0, longMoveCanvas.width, longMoveCanvas.height, this._x, this._y, longMoveCanvas.width / SCALE, longMoveCanvas.height / SCALE)
  }
}

window.addEventListener('beforeunload', () => {
  const mainwindow = remote.BrowserWindow.fromId(ipcRenderer.sendSync('mainWindowId'))
  mainwindow.webContents.send('liveEnd', null, false)
})

function createAudio (src: string) {
  const audio = new Audio(src)
  audio.preload = 'auto'
  return audio
}

function newImage (src: string) {
  let img = new Image()
  img.src = src
  return img
}

function main () {
  const song = ipcRenderer.sendSync('getSong')
  if (!song) return

  // console.log(song)
  let name = parse(song.src).name.substr(parse(song.src).name.indexOf('-') + 1)
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

main()
