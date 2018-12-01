import '../css/mishiro.css'
import '../css/game.css'
import { ipcRenderer, remote } from 'electron'
import { parse, relative } from 'path'
import { ScoreNote } from './main/on-score'

const NOTE_WIDTH = 102
const NOTE_HEIGHT = 102
const NOTE_WIDTH_FLIP = 125
const NOTE_WIDTH_DELTA = NOTE_WIDTH_FLIP - NOTE_WIDTH
const NOTE_WIDTH_HALF = NOTE_WIDTH / 2
const NOTE_HEIGHT_HALF = NOTE_HEIGHT / 2

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

interface Song<ScoreType> {
  src: string
  bpm: number
  score: ScoreType[]
  fullCombo: number
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

  private static CANVAS_WIDTH = 1280
  private static CANVAS_HEIGHT = 720
  public static X: number[] = [238, 414, 589, 764, 937]
  private static BOTTOM = 20
  public static TOP_TO_TARGET_POSITION = ScoreViewer.CANVAS_HEIGHT - ScoreViewer.BOTTOM - 114 + 6

  public frontCanvas: HTMLCanvasElement
  public backCanvas: HTMLCanvasElement
  public frontCtx: CanvasRenderingContext2D
  public backCtx: CanvasRenderingContext2D
  public song: Song<ScoreNoteWithNoteInstance>
  public audio: HTMLAudioElement
  public pauseButton: HTMLButtonElement
  public rangeInput: HTMLInputElement
  public speedInput: HTMLInputElement
  public options: Option = {
    speed: 12 // * 60 px / s
  }

  private _isReady: boolean = false
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
      this.frontCtx.clearRect(211, 0, 857, ScoreViewer.CANVAS_HEIGHT - 15)
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
      (this.song.score[i]._instance as Note).setY(ScoreViewer.TOP_TO_TARGET_POSITION - (~~(this.options.speed * 60 * (this.song.score[i].sec - this.audio.currentTime))))
    }

    if (combo === -1) combo = this.song.score.length
    if (this._comboDom.innerHTML !== '' + combo) this._comboDom.innerHTML = '' + combo

    for (let i = combo; i < this.song.score.length; i++) {
      (this.song.score[i]._instance as Note).setY(ScoreViewer.TOP_TO_TARGET_POSITION - (~~(this.options.speed * 60 * (this.song.score[i].sec - this.audio.currentTime))))
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

  private _resolveDOM (el: HTMLElement) {
    this.frontCanvas = document.createElement('canvas')
    this.backCanvas = document.createElement('canvas')
    this.frontCanvas.width = this.backCanvas.width = ScoreViewer.CANVAS_WIDTH
    this.frontCanvas.height = this.backCanvas.height = ScoreViewer.CANVAS_HEIGHT
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
    el.appendChild(this.rangeInput)
    el.appendChild(this.speedInput)
    this._comboDom = document.getElementById('combo') as HTMLDivElement

    this.frontCtx = this.frontCanvas.getContext('2d') as CanvasRenderingContext2D
    this.backCtx = this.backCanvas.getContext('2d') as CanvasRenderingContext2D
    this.frontCtx.fillStyle = 'rgba(255, 255, 255, 0.66)'

    const liveIcon = newImage('../../asset/img.asar/live_icon_857x114.png')
    liveIcon.addEventListener('load', () => {
      this.backCtx.drawImage(liveIcon, 211, ScoreViewer.CANVAS_HEIGHT - ScoreViewer.BOTTOM - 114)
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
  private _sec: number
  protected _x: number
  protected _y: number
  protected _connection: ScoreNoteWithNoteInstance | null
  protected _synchronizedNote: ScoreNoteWithNoteInstance | null

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

  protected _drawSync (sv: ScoreViewer) {
    if (!this._synchronizedNote) return

    const connectionHeight = 20
    const syncX = ScoreViewer.X[this._synchronizedNote.finishPos - 1] + NOTE_WIDTH_HALF
    const syncY = ScoreViewer.TOP_TO_TARGET_POSITION - (~~(sv.options.speed * 60 * (this._sec - sv.audio.currentTime))) + NOTE_HEIGHT_HALF - connectionHeight / 2
    const selfX = this._x + NOTE_WIDTH_HALF
    sv.frontCtx.fillRect((selfX < syncX ? selfX : syncX) + NOTE_WIDTH_HALF, syncY, (selfX < syncX ? syncX - selfX : selfX - syncX) - NOTE_WIDTH, connectionHeight)

  }

  protected _isNeedDraw (): boolean {
    if (this._y < -NOTE_HEIGHT) {
      if (!this._connection) return false
      return (this._connection._instance as Note)._y >= -NOTE_HEIGHT
    }
    return this._y < ScoreViewer.TOP_TO_TARGET_POSITION
  }

  abstract draw (sv: ScoreViewer): void
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

  private _drawFlipConnection (sv: ScoreViewer, connectionX: number, connectionY: number) {
    if (connectionY >= ScoreViewer.TOP_TO_TARGET_POSITION) return
    const xCenter = this._status === 1 ? this._x + NOTE_WIDTH_DELTA + NOTE_WIDTH_HALF : this._x + NOTE_WIDTH_HALF
    sv.frontCtx.beginPath()
    sv.frontCtx.moveTo(xCenter, this._y)
    sv.frontCtx.lineTo(xCenter, this._y + NOTE_HEIGHT)
    sv.frontCtx.lineTo(connectionX + NOTE_WIDTH_HALF, connectionY + NOTE_HEIGHT)
    sv.frontCtx.lineTo(connectionX + NOTE_WIDTH_HALF, connectionY)
    sv.frontCtx.lineTo(xCenter, this._y)
    sv.frontCtx.fill()
  }

  private _drawLongConnection (sv: ScoreViewer, connectionY: number) {
    const x = this._status === 1 ? this._x + NOTE_WIDTH_DELTA : this._x
    sv.frontCtx.beginPath()
    sv.frontCtx.arc(x + NOTE_WIDTH_HALF, this._y + NOTE_HEIGHT_HALF, NOTE_WIDTH_HALF, 0, Math.PI, true)
    const targetY = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? ScoreViewer.TOP_TO_TARGET_POSITION + NOTE_HEIGHT_HALF : connectionY + NOTE_HEIGHT_HALF
    sv.frontCtx.lineTo(x, targetY)
    sv.frontCtx.arc(x + NOTE_WIDTH_HALF, targetY, NOTE_WIDTH_HALF, Math.PI, 2 * Math.PI, true)
    sv.frontCtx.lineTo(x + NOTE_WIDTH, this._y + NOTE_HEIGHT_HALF)
    sv.frontCtx.fill()
  }

  private _drawMoveConnection (sv: ScoreViewer, connectionX: number, connectionY: number) {
    sv.frontCtx.beginPath()
    sv.frontCtx.arc(this._status === 1 ? this._x + NOTE_WIDTH_HALF + NOTE_WIDTH_DELTA : this._x + NOTE_WIDTH_HALF, this._y + NOTE_HEIGHT_HALF, NOTE_WIDTH_HALF, 0, Math.PI, true)
    const targetY = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? ScoreViewer.TOP_TO_TARGET_POSITION + NOTE_HEIGHT_HALF : connectionY + NOTE_HEIGHT_HALF
    const targetX = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? connectionX + ((this._x - connectionX) * (-(ScoreViewer.TOP_TO_TARGET_POSITION - connectionY)) / ((-(ScoreViewer.TOP_TO_TARGET_POSITION - connectionY)) + (ScoreViewer.TOP_TO_TARGET_POSITION - this._y))) : connectionX
    sv.frontCtx.lineTo(targetX, targetY)
    sv.frontCtx.arc(targetX + NOTE_WIDTH_HALF, targetY, NOTE_WIDTH_HALF, Math.PI, 2 * Math.PI, true)
    sv.frontCtx.lineTo(this._status === 1 ? this._x + NOTE_WIDTH + NOTE_WIDTH_DELTA : this._x + NOTE_WIDTH, this._y + NOTE_HEIGHT_HALF)
    sv.frontCtx.fill()
    if (connectionY > ScoreViewer.TOP_TO_TARGET_POSITION) sv.frontCtx.drawImage(longMoveWhiteCanvas, targetX, targetY - NOTE_HEIGHT_HALF)
  }

  public draw (sv: ScoreViewer) {
    if (!this._isNeedDraw()) return

    this._drawSync(sv)
    if (this._connection) {
      const connectionX = ScoreViewer.X[this._connection.finishPos - 1]
      const connectionY = ScoreViewer.TOP_TO_TARGET_POSITION - (~~(sv.options.speed * 60 * (this._connection.sec - sv.audio.currentTime)))
      if (this._connection.type === 1) {
        this._drawFlipConnection(sv, connectionX, connectionY)
      } else if (this._connection.type === 2) {
        if (this._connection.status === 0) {
          this._drawLongConnection(sv, connectionY)
        } else {
          this._drawFlipConnection(sv, connectionX, connectionY)
        }
      } else if (this._connection.type === 3) {
        if (this._connection.status === 0) {
          this._drawMoveConnection(sv, connectionX, connectionY)
        } else {
          this._drawFlipConnection(sv, connectionX, connectionY)
        }
      }
    }
    sv.frontCtx.drawImage(this._status === 1 ? flipLeftCanvas : flipRightCanvas, this._x, this._y)
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
      const connectionY = ScoreViewer.TOP_TO_TARGET_POSITION - (~~(sv.options.speed * 60 * (this._connection.sec - sv.audio.currentTime)))
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
      const connectionY = ScoreViewer.TOP_TO_TARGET_POSITION - (~~(sv.options.speed * 60 * (this._connection.sec - sv.audio.currentTime)))
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
  let name = parse(song.src).name.split('-')[1]
  document.getElementsByTagName('title')[0].innerHTML = name
  ScoreViewer.init(song, document.body).start()
}

main()
