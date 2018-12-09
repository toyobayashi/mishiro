import { globalInstance } from './global'
import { ScoreNote } from '../../main/on-score'
import Note from './note'
import ScoreViewer from './score-viewer'

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

  public drawConnection (sv: ScoreViewer) {
    if (this._connection) {
      const connectionY = ScoreViewer.calY(sv.options.speed, this._connection.sec, sv.audio.currentTime)
      sv.frontCtx.beginPath()
      sv.frontCtx.arc(this._x + globalInstance.noteWidthHalf, this._y + globalInstance.noteHeightHalf, globalInstance.noteWidthHalf, 0, Math.PI, true)
      const targetY = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? ScoreViewer.TOP_TO_TARGET_POSITION + globalInstance.noteHeightHalf : connectionY + globalInstance.noteHeightHalf
      sv.frontCtx.lineTo(this._x, targetY)
      sv.frontCtx.arc(this._x + globalInstance.noteWidthHalf, targetY, globalInstance.noteWidthHalf, Math.PI, 2 * Math.PI, true)
      sv.frontCtx.lineTo(this._x + globalInstance.noteWidth, this._y + globalInstance.noteHeightHalf)
      sv.frontCtx.fill()
    }
  }

  public drawNote (sv: ScoreViewer) {
    sv.frontCtx.drawImage(globalInstance.longLoopCanvas, this._x, this._y)
  }

  public saveDrawConnection (sv: ScoreViewer) {
    if (this._connection) {
      const connectionY = ScoreViewer.saveCalY(sv, this._connection.sec)
      sv.saveCtx.beginPath()
      sv.saveCtx.arc(this._x + globalInstance.noteWidthHalf, this._y + globalInstance.noteHeightHalf, globalInstance.noteWidthHalf, 0, Math.PI, true)
      const targetY = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? ScoreViewer.TOP_TO_TARGET_POSITION + globalInstance.noteHeightHalf : connectionY + globalInstance.noteHeightHalf
      sv.saveCtx.lineTo(this._x, targetY)
      sv.saveCtx.arc(this._x + globalInstance.noteWidthHalf, targetY, globalInstance.noteWidthHalf, Math.PI, 2 * Math.PI, true)
      sv.saveCtx.lineTo(this._x + globalInstance.noteWidth, this._y + globalInstance.noteHeightHalf)
      sv.saveCtx.fill()
    }
  }

  public saveDrawNote (sv: ScoreViewer) {
    sv.saveCtx.drawImage(globalInstance.longLoopCanvas, 0, 0, globalInstance.longLoopCanvas.width, globalInstance.longLoopCanvas.height, this._x, this._y, globalInstance.longLoopCanvas.width / globalInstance.scale, globalInstance.longLoopCanvas.height / globalInstance.scale)
  }
}

export default LongNote
