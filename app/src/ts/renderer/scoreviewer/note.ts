import { globalInstance } from './global'
import { ScoreNote } from '../../main/on-score'
import ScoreViewer from './score-viewer'

export interface ScoreNoteWithNoteInstance extends ScoreNote {
  _instance?: Note
}

abstract class Note {
  protected _sec: number
  protected _x: number
  protected _y: number
  protected _connection: ScoreNoteWithNoteInstance | null
  protected _synchronizedNote: ScoreNoteWithNoteInstance | null
  private readonly _connectionHeight = 12

  constructor (note: ScoreNote) {
    this._sec = note.sec
    this._x = ScoreViewer.X[note.finishPos - 1]
    this._y = -globalInstance.noteHeight
    this._connection = null
    this._synchronizedNote = null
  }

  public setY (y: number): void {
    this._y = y
  }

  public getX (): number {
    return this._x
  }

  public setX (x: number): void {
    this._x = x
  }

  public saveDrawSync (sv: ScoreViewer): void{
    if (!this._synchronizedNote) return

    const syncX = ScoreViewer.X[this._synchronizedNote.finishPos - 1] + globalInstance.noteWidthHalf
    const syncY = ScoreViewer.saveCalY(sv, this._sec) + globalInstance.noteHeightHalf - this._connectionHeight / 2 / globalInstance.scale
    const selfX = this._x + globalInstance.noteWidthHalf + (ScoreViewer.X.includes(this._x) ? 0 : globalInstance.noteWidthDelta)
    sv.saveCtx.fillRect((selfX < syncX ? selfX : syncX) + globalInstance.noteWidthHalf, syncY, (selfX < syncX ? syncX - selfX : selfX - syncX) - globalInstance.noteWidth, this._connectionHeight / globalInstance.scale)
  }

  public drawSync (sv: ScoreViewer): void {
    if (!this._synchronizedNote) return

    const syncX = ScoreViewer.X[this._synchronizedNote.finishPos - 1] + globalInstance.noteWidthHalf
    const syncY = ScoreViewer.calY(sv.options.speed, this._sec, sv.audio.currentTime) + globalInstance.noteHeightHalf - this._connectionHeight / 2
    const selfX = this._x + globalInstance.noteWidthHalf + (ScoreViewer.X.includes(this._x) ? 0 : globalInstance.noteWidthDelta)
    sv.frontCtx.fillRect((selfX < syncX ? selfX : syncX) + globalInstance.noteWidthHalf, syncY, (selfX < syncX ? syncX - selfX : selfX - syncX) - globalInstance.noteWidth, this._connectionHeight)
  }

  public isNeedDraw (): boolean {
    if (this._y < -globalInstance.noteHeight) {
      if (!this._connection) return false
      return (this._connection._instance as Note)._y >= -globalInstance.noteHeight
    }
    return this._y < ScoreViewer.TOP_TO_TARGET_POSITION
  }

  public abstract saveDrawConnection (sv: ScoreViewer): void
  public abstract saveDrawNote (sv: ScoreViewer): void
  public abstract drawConnection (sv: ScoreViewer): void
  public abstract drawNote (sv: ScoreViewer): void
}

export default Note
