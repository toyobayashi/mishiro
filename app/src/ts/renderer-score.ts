import '../css/game.css'
import { ipcRenderer, remote } from 'electron'
import { parse, relative } from 'path'
import { ScoreNote } from './main/on-score'

const tapCanvas = document.createElement('canvas')
const longLoopCanvas = document.createElement('canvas')
const longMoveCanvas = document.createElement('canvas')
const longMoveWhiteCanvas = document.createElement('canvas')
const flipLeftCanvas = document.createElement('canvas')
const flipRightCanvas = document.createElement('canvas')
tapCanvas.width = longLoopCanvas.width = longMoveCanvas.width = longMoveWhiteCanvas.width = tapCanvas.height = longLoopCanvas.height = longMoveCanvas.height = longMoveWhiteCanvas.height = flipLeftCanvas.height = flipRightCanvas.height = 102
flipLeftCanvas.width = flipRightCanvas.width = 125

const iconNotesImg = newImage('../../asset/img.asar/icon_notes.png')
iconNotesImg.addEventListener('load', () => {
  (tapCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, 0, 0, 102, 102, 0, 0, 102, 102);
  (longLoopCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, 102, 0, 102, 102, 0, 0, 102, 102);
  (longMoveCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, 102 + 102, 0, 102, 102, 0, 0, 102, 102);
  (longMoveWhiteCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, 102 + 102 + 102, 0, 102, 102, 0, 0, 102, 102);
  (flipLeftCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, 102 + 102 + 102 + 102, 0, 125, 102, 0, 0, 125, 102);
  (flipRightCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, 102 + 102 + 102 + 102 + 125, 0, 125, 102, 0, 0, 125, 102)
})

interface Song {
  src: string
  bpm: number
  score: ScoreNote[]
  fullCombo: number
}

interface Option {
  speed: number
}

class Score {

  private static _instance: Score | null = null
  public static get (song: Song) {
    return new Score(song)
  }

  private static CANVAS_WIDTH = 1280
  private static CANVAS_HEIGHT = 720
  private static X: number[] = [238, 414, 589, 764, 937]
  private static BOTTOM = 20
  private static TOP_TO_TARGET_POSITION = Score.CANVAS_HEIGHT - Score.BOTTOM - 114 + 6

  public frontCanvas: HTMLCanvasElement
  public backCanvas: HTMLCanvasElement
  public frontCtx: CanvasRenderingContext2D
  public backCtx: CanvasRenderingContext2D
  public song: Song
  public audio: HTMLAudioElement
  private _options: Option = {
    speed: 12 // * 60 px / s
  }
  // private _isPlaying: boolean = false
  private _init: boolean = false
  private _isReady: boolean = false
  private _t: number
  private _isClean = true
  private _comboDom: HTMLDivElement

  private _preCalculation = {
    timeRange: 1.5 * ((Score.TOP_TO_TARGET_POSITION + 102) / (this._options.speed * 60))
  }

  public init () {
    if (this._init) return

    let liveIcon = newImage('../../asset/img.asar/live_icon_857x114.png')
    liveIcon.addEventListener('load', () => {
      this.backCtx.drawImage(liveIcon, 211, Score.CANVAS_HEIGHT - Score.BOTTOM - 114)
    }, false)

    this.audio.addEventListener('play', () => {
      console.log(this.audio.duration)
    })

    this.audio.addEventListener('ended', () => {
      window.close()
    }, false)

    this.audio.addEventListener('canplay', () => {
      this._isReady = true
    })

    this.audio.addEventListener('pause', () => {
      console.log(this.audio.currentTime + ' / ' + this.audio.duration)
    })

    this._init = true
  }

  public start () {
    if (!this._isReady) {
      setTimeout(() => {
        this.start()
      }, 100)
      return
    }

    this.audio.play()

    this._frame()
  }

  private _frame () {
    const notes = this._cal()
    this._renderNote(notes)
    this._t = window.requestAnimationFrame(() => {
      this._frame()
    })
  }

  public stop () {
    this.audio.pause()
    window.cancelAnimationFrame(this._t)
    this._clear()
  }

  private _clear () {
    if (!this._isClean) {
      this.frontCtx.clearRect(211, 0, 857, Score.CANVAS_HEIGHT - 15)
      this._isClean = true
    }
  }

  private _cal () {
    // search note
    // const notes = []
    // console.log(this.audio.currentTime + ' / ' + this.audio.duration)
    let found = false
    let begin = -1
    let end = -1
    if (this.audio.currentTime <= this.audio.duration / 2) {
      // search note from beginning
      for (let i = 0; i < this.song.score.length; i++) {
        if (this.song.score[i].sec > this.audio.currentTime && this.song.score[i].sec < this.audio.currentTime + this._preCalculation.timeRange) {
          if (!found) {
            found = true
            begin = i
          }
          // notes.push(this.song.score[i])
        } else {
          if (found) {
            end = i - 1
            break
          }
        }
      }
    } else {
      // search note from ending
      for (let i = this.song.score.length - 1; i >= 0; i--) {
        if (this.song.score[i].sec > this.audio.currentTime && this.song.score[i].sec < this.audio.currentTime + this._preCalculation.timeRange) {
          if (!found) {
            found = true
            end = i
          }
          // notes.unshift(this.song.score[i])
        } else {
          if (found) {
            begin = i + 1
            break
          }
        }
      }
    }
    console.log(begin, end)
    return (begin !== -1 && end !== -1) ? ((begin << 16) | end) : -1
  }

  private _renderNote (notes: number) {

    this._clear()
    if (notes === -1) {
      if (this.audio.currentTime > 4 * this.audio.duration / 5) {
        if (this._comboDom.innerHTML !== '' + this.song.fullCombo) this._comboDom.innerHTML = '' + this.song.fullCombo
      }
      return
    }
    const begin = (notes & 0xffff0000) >> 16
    const end = notes & 0xffff
    if (this._comboDom.innerHTML !== '' + begin) this._comboDom.innerHTML = '' + begin
    // console.log(begin, end)
    for (let i = begin; i <= end; i++) {
      const note = this.song.score[i]
      const distance = ~~(this._options.speed * 60 * (note.sec - this.audio.currentTime))
      switch (note.type) {
        case 1:
          if (note.status === 0) this.frontCtx.drawImage(tapCanvas, Score.X[note.finishPos - 1], Score.TOP_TO_TARGET_POSITION - distance)
          else if (note.status === 1) this.frontCtx.drawImage(flipLeftCanvas, Score.X[note.finishPos - 1] - 23, Score.TOP_TO_TARGET_POSITION - distance)
          else if (note.status === 2) this.frontCtx.drawImage(flipRightCanvas, Score.X[note.finishPos - 1], Score.TOP_TO_TARGET_POSITION - distance)
          break
        case 2:
          this.frontCtx.drawImage(longLoopCanvas, Score.X[note.finishPos - 1], Score.TOP_TO_TARGET_POSITION - distance)
          break
        case 3:
          this.frontCtx.drawImage(longMoveCanvas, Score.X[note.finishPos - 1], Score.TOP_TO_TARGET_POSITION - distance)
          break
        default:
          break
      }
    }
    this._isClean = false
  }

  constructor (song: Song, options?: Option) {
    if (Score._instance) return Score._instance

    if (options) this._options = Object.assign({}, this._options, options)

    this.frontCanvas = document.createElement('canvas')
    this.backCanvas = document.createElement('canvas')
    this.frontCanvas.width = this.backCanvas.width = Score.CANVAS_WIDTH
    this.frontCanvas.height = this.backCanvas.height = Score.CANVAS_HEIGHT
    this.frontCanvas.className = this.backCanvas.className = 'canvas canvas-center'

    document.body.appendChild(this.backCanvas)
    document.body.appendChild(this.frontCanvas)
    this._comboDom = document.getElementById('combo') as HTMLDivElement

    this.frontCtx = this.frontCanvas.getContext('2d') as CanvasRenderingContext2D
    this.backCtx = this.backCanvas.getContext('2d') as CanvasRenderingContext2D
    this.song = song

    this.audio = process.env.NODE_ENV === 'production' ? createAudio(song.src) : createAudio(relative(__dirname, song.src))
    Score._instance = this
    return Score._instance
  }
}

window.addEventListener('beforeunload', () => {
  const mainwindow = remote.BrowserWindow.fromId(ipcRenderer.sendSync('mainWindowId'))
  mainwindow.webContents.send('liveEnd', null, false)
})

// ipcRenderer.once('start', (_e: Event, song: Song) => {
//   console.log(song)
//   let name = parsePath(song.src).name.split('-')[1]
//   document.getElementsByTagName('title')[0].innerHTML = name
//   const globalScore = Score.get(song)
//   globalScore.init()
//   globalScore.start()
// })

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

  console.log(song)
  let name = parse(song.src).name.split('-')[1]
  document.getElementsByTagName('title')[0].innerHTML = name
  const globalScore = Score.get(song)
  globalScore.init()
  globalScore.start()
}

main()
