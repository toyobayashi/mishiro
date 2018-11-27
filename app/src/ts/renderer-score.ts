import '../css/game.css'
import { ipcRenderer, Event, remote } from 'electron'
import { parse as parsePath, relative } from 'path'
import { parse as parseUrl } from 'url'
import { parse as parseQuery } from 'querystring'
import { ScoreNote } from './main/on-score'

interface Song {
  src: string
  bpm: number
  score: ScoreNote[]
  fullCombo: number
}

class Score {
  public frontCanvas: HTMLCanvasElement
  public backCanvas: HTMLCanvasElement
  public frontCtx: CanvasRenderingContext2D
  public backCtx: CanvasRenderingContext2D
  public song: Song
  public audio: HTMLAudioElement
  public init () {
    let liveIcon = newImage('../../asset/img.asar/live_icon_857x114.png')
    liveIcon.addEventListener('load', () => {
      this.backCtx.drawImage(liveIcon, 211.5, 586)
    }, false)

    this.audio.addEventListener('play', () => {
      setTimeout(() => console.log(this.audio.duration), 2000)
    })
    this.audio.addEventListener('ended', () => {
      window.close()
    }, false)
  }

  public start () {
    this.audio.play().catch(err => console.log(err))
  }

  constructor (song: Song) {
    this.frontCanvas = document.createElement('canvas')
    this.backCanvas = document.createElement('canvas')
    document.body.appendChild(this.backCanvas)
    document.body.appendChild(this.frontCanvas)
    this.frontCanvas.width = this.backCanvas.width = 1280
    this.frontCanvas.height = this.backCanvas.height = 720
    this.frontCanvas.className = this.backCanvas.className = 'canvas canvas-center'

    this.frontCtx = this.frontCanvas.getContext('2d') as CanvasRenderingContext2D
    this.backCtx = this.backCanvas.getContext('2d') as CanvasRenderingContext2D
    this.song = song

    this.audio = process.env.NODE_ENV === 'production' ? createAudio(song.src) : createAudio(relative(__dirname, song.src))
  }
}

window.addEventListener('beforeunload', () => {
  const fromWindowId = Number(parseQuery(parseUrl(window.location.href).query as string).from)
  const fromWindow = remote.BrowserWindow.fromId(fromWindowId)
  fromWindow.webContents.send('liveEnd', null, false)
})

ipcRenderer.once('start', (_e: Event, song: Song) => {
  console.log(song)
  let name = parsePath(song.src).name.split('-')[1]
  document.getElementsByTagName('title')[0].innerHTML = name
  const globalScore = new Score(song)
  globalScore.init()
  globalScore.start()
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
