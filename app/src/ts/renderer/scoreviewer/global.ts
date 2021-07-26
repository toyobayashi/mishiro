import { error } from '../log'

export interface GlobalConstructorArgument {
  noteWidth?: number
  noteHeight?: number
  noteWidthFlip?: number
  scale?: number
  saveSpeed?: number
  notePng: string
  se?: string
  seOk?: string
}

export interface Song<ScoreType> {
  src: string
  bpm: number
  score: ScoreType[]
  fullCombo: number
  difficulty: string
}

export interface Option {
  speed: number
}

class Global {
  public noteWidth: number = 102
  public noteHeight: number = 102
  public noteWidthFlip: number = 125
  public scale: number = 3
  public saveSpeed: number = 12
  private readonly _notePng: string = ''

  public tapCanvas: HTMLCanvasElement = document.createElement('canvas')
  public longLoopCanvas: HTMLCanvasElement = document.createElement('canvas')
  public longMoveCanvas: HTMLCanvasElement = document.createElement('canvas')
  public longMoveWhiteCanvas: HTMLCanvasElement = document.createElement('canvas')
  public flipLeftCanvas: HTMLCanvasElement = document.createElement('canvas')
  public flipRightCanvas: HTMLCanvasElement = document.createElement('canvas')
  private _se: HTMLAudioElement | null = null
  private _seOk: HTMLAudioElement | null = null

  private static _instance: Global | null = null
  public static newImage (src: string): HTMLImageElement {
    const img = new Image()
    img.src = src
    return img
  }

  public static createAudio (src: string): HTMLAudioElement {
    const audio = new Audio(src)
    audio.preload = 'auto'
    return audio
  }

  constructor (options: GlobalConstructorArgument) {
    if (Global._instance) return Global._instance
    this.noteWidth = options.noteWidth || this.noteWidth
    this.noteHeight = options.noteHeight || this.noteHeight
    this.noteWidthFlip = options.noteWidthFlip || this.noteWidthFlip
    this.scale = options.scale || this.scale
    this.saveSpeed = options.saveSpeed || this.saveSpeed
    this._notePng = options.notePng

    this.tapCanvas.width = this.longLoopCanvas.width = this.longMoveCanvas.width = this.longMoveWhiteCanvas.width = this.tapCanvas.height = this.longLoopCanvas.height = this.longMoveCanvas.height = this.longMoveWhiteCanvas.height = this.flipLeftCanvas.height = this.flipRightCanvas.height = this.noteWidth
    this.flipLeftCanvas.width = this.flipRightCanvas.width = this.noteWidthFlip
    const iconNotesImg = Global.newImage(this._notePng)
    iconNotesImg.addEventListener('load', () => {
      (this.tapCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, 0, 0, this.noteWidth, this.noteHeight, 0, 0, this.noteWidth, this.noteHeight);
      (this.longLoopCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, this.noteWidth, 0, this.noteWidth, this.noteHeight, 0, 0, this.noteWidth, this.noteHeight);
      (this.longMoveCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, this.noteWidth * 2, 0, this.noteWidth, this.noteHeight, 0, 0, this.noteWidth, this.noteHeight);
      (this.longMoveWhiteCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, this.noteWidth * 3, 0, this.noteWidth, this.noteHeight, 0, 0, this.noteWidth, this.noteHeight);
      (this.flipLeftCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, this.noteWidth * 4, 0, this.noteWidthFlip, this.noteHeight, 0, 0, this.noteWidthFlip, this.noteHeight);
      (this.flipRightCanvas.getContext('2d') as CanvasRenderingContext2D).drawImage(iconNotesImg, this.noteWidth * 4 + this.noteWidthFlip, 0, this.noteWidthFlip, this.noteHeight, 0, 0, this.noteWidthFlip, this.noteHeight)
    })

    if (options.se) this._se = Global.createAudio(options.se)
    if (options.seOk) this._seOk = Global.createAudio(options.seOk)

    Global._instance = this
    return this
  }

  get noteWidthDelta (): number {
    return this.noteWidthFlip - this.noteWidth
  }

  get noteWidthHalf (): number {
    return this.noteWidth / 2
  }

  get noteHeightHalf (): number {
    return this.noteHeight / 2
  }

  public getInstance (): Global {
    if (!Global._instance) throw new Error('Global instance null.')
    return Global._instance
  }

  public playSe (): void {
    if (this._se) {
      this._se.currentTime = 0
      this._se.play().catch(err => {
        console.error(err)
        error(`SCOREVIEWER playSe: ${err.stack}`)
      })
    }
  }

  public playSeOk (): void {
    if (this._seOk) {
      this._seOk.currentTime = 0
      this._seOk.play().catch(err => {
        console.error(err)
        error(`SCOREVIEWER playSeOk: ${err.stack}`)
      })
    }
  }
}

export const globalInstance = new Global({
  notePng: '../../asset/img.asar/icon_notes.png',
  se: '../../asset/se.asar/se_common_cancel.mp3',
  seOk: '../../asset/se.asar/se_common_enter.mp3'
})

export default Global
