import { globalInstance } from './global'
import type { ScoreNote } from '../../main/on-score'
import Note from './note'
import ScoreViewer from './score-viewer'

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

  public drawConnection (sv: ScoreViewer): void {
    if (this._connection) {
      const connectionX = ScoreViewer.X[this._connection.finishPos - 1]
      const connectionY = ScoreViewer.calY(sv.options.speed, this._connection.sec, sv.audio.currentTime)
      sv.frontCtx.beginPath()
      sv.frontCtx.arc(this._x + globalInstance.noteWidthHalf, this._y + globalInstance.noteHeightHalf, globalInstance.noteWidthHalf, 0, Math.PI, true)
      const targetY = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? ScoreViewer.TOP_TO_TARGET_POSITION + globalInstance.noteHeightHalf : connectionY + globalInstance.noteHeightHalf
      const targetX = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? connectionX + ((this._x - connectionX) * (-(ScoreViewer.TOP_TO_TARGET_POSITION - connectionY)) / ((-(ScoreViewer.TOP_TO_TARGET_POSITION - connectionY)) + (ScoreViewer.TOP_TO_TARGET_POSITION - this._y))) : connectionX
      sv.frontCtx.lineTo(targetX, targetY)
      sv.frontCtx.arc(targetX + globalInstance.noteWidthHalf, targetY, globalInstance.noteWidthHalf, Math.PI, 2 * Math.PI, true)
      sv.frontCtx.lineTo(this._x + globalInstance.noteWidth, this._y + globalInstance.noteHeightHalf)
      sv.frontCtx.fill()
      if (connectionY > ScoreViewer.TOP_TO_TARGET_POSITION) sv.frontCtx.drawImage(globalInstance.longMoveWhiteCanvas, targetX, targetY - globalInstance.noteHeightHalf)
    }
  }

  public drawNote (sv: ScoreViewer): void {
    sv.frontCtx.drawImage(globalInstance.longMoveCanvas, this._x, this._y)
  }

  public saveDrawConnection (sv: ScoreViewer): void {
    if (this._connection) {
      const connectionX = ScoreViewer.X[this._connection.finishPos - 1]
      const connectionY = ScoreViewer.saveCalY(sv, this._connection.sec)
      sv.saveCtx.beginPath()
      sv.saveCtx.arc(this._x + globalInstance.noteWidthHalf, this._y + globalInstance.noteHeightHalf, globalInstance.noteWidthHalf, 0, Math.PI, true)
      const targetY = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? ScoreViewer.TOP_TO_TARGET_POSITION + globalInstance.noteHeightHalf : connectionY + globalInstance.noteHeightHalf
      const targetX = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? connectionX + ((this._x - connectionX) * (-(ScoreViewer.TOP_TO_TARGET_POSITION - connectionY)) / ((-(ScoreViewer.TOP_TO_TARGET_POSITION - connectionY)) + (ScoreViewer.TOP_TO_TARGET_POSITION - this._y))) : connectionX
      sv.saveCtx.lineTo(targetX, targetY)
      sv.saveCtx.arc(targetX + globalInstance.noteWidthHalf, targetY, globalInstance.noteWidthHalf, Math.PI, 2 * Math.PI, true)
      sv.saveCtx.lineTo(this._x + globalInstance.noteWidth, this._y + globalInstance.noteHeightHalf)
      sv.saveCtx.fill()
      if (connectionY > ScoreViewer.TOP_TO_TARGET_POSITION) sv.saveCtx.drawImage(globalInstance.longMoveWhiteCanvas, 0, 0, globalInstance.longMoveWhiteCanvas.width, globalInstance.longMoveWhiteCanvas.height, targetX, targetY - globalInstance.noteHeightHalf, globalInstance.longMoveWhiteCanvas.width / globalInstance.scale, globalInstance.longMoveWhiteCanvas.height / globalInstance.scale)
    }
  }

  public saveDrawNote (sv: ScoreViewer): void {
    sv.saveCtx.drawImage(globalInstance.longMoveCanvas, 0, 0, globalInstance.longMoveCanvas.width, globalInstance.longMoveCanvas.height, this._x, this._y, globalInstance.longMoveCanvas.width / globalInstance.scale, globalInstance.longMoveCanvas.height / globalInstance.scale)
  }
}

export default LongMoveNote
