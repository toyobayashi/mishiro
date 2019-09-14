import { globalInstance } from './global'
import { ScoreNote } from '../../main/on-score'
import Note from './note'
import ScoreViewer from './score-viewer'

class FlipNote extends Note {
  private readonly _status: number
  constructor (note: ScoreNote, connectionNote?: ScoreNote, syncNote?: ScoreNote) {
    super(note)
    this._status = note.status
    if (this._status === 1) {
      this._x = this._x - globalInstance.noteWidthDelta
    }
    if (connectionNote) {
      this._connection = connectionNote
    }
    if (syncNote) {
      this._synchronizedNote = syncNote
    }
  }

  private _drawFlipConnection (ctx: CanvasRenderingContext2D, connectionX: number, connectionY: number): void {
    if (connectionY >= ScoreViewer.TOP_TO_TARGET_POSITION) return
    const xCenter = this._status === 1 ? this._x + globalInstance.noteWidthDelta + globalInstance.noteWidthHalf : this._x + globalInstance.noteWidthHalf
    ctx.beginPath()
    ctx.moveTo(xCenter, this._y)
    ctx.lineTo(xCenter, this._y + globalInstance.noteHeight)
    ctx.lineTo(connectionX + globalInstance.noteWidthHalf, connectionY + globalInstance.noteHeight)
    ctx.lineTo(connectionX + globalInstance.noteWidthHalf, connectionY)
    ctx.lineTo(xCenter, this._y)
    ctx.fill()
  }

  private _drawLongConnection (ctx: CanvasRenderingContext2D, connectionY: number): void {
    const x = this._status === 1 ? this._x + globalInstance.noteWidthDelta : this._x
    ctx.beginPath()
    ctx.arc(x + globalInstance.noteWidthHalf, this._y + globalInstance.noteHeightHalf, globalInstance.noteWidthHalf, 0, Math.PI, true)
    const targetY = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? ScoreViewer.TOP_TO_TARGET_POSITION + globalInstance.noteHeightHalf : connectionY + globalInstance.noteHeightHalf
    ctx.lineTo(x, targetY)
    ctx.arc(x + globalInstance.noteWidthHalf, targetY, globalInstance.noteWidthHalf, Math.PI, 2 * Math.PI, true)
    ctx.lineTo(x + globalInstance.noteWidth, this._y + globalInstance.noteHeightHalf)
    ctx.fill()
  }

  private _drawMoveConnection (ctx: CanvasRenderingContext2D, connectionX: number, connectionY: number, SCALE?: number): void {
    ctx.beginPath()
    ctx.arc(this._status === 1 ? this._x + globalInstance.noteWidthHalf + globalInstance.noteWidthDelta : this._x + globalInstance.noteWidthHalf, this._y + globalInstance.noteHeightHalf, globalInstance.noteWidthHalf, 0, Math.PI, true)
    const targetY = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? ScoreViewer.TOP_TO_TARGET_POSITION + globalInstance.noteHeightHalf : connectionY + globalInstance.noteHeightHalf
    const targetX = connectionY > ScoreViewer.TOP_TO_TARGET_POSITION ? connectionX + ((this._x - connectionX) * (-(ScoreViewer.TOP_TO_TARGET_POSITION - connectionY)) / ((-(ScoreViewer.TOP_TO_TARGET_POSITION - connectionY)) + (ScoreViewer.TOP_TO_TARGET_POSITION - this._y))) : connectionX
    ctx.lineTo(targetX, targetY)
    ctx.arc(targetX + globalInstance.noteWidthHalf, targetY, globalInstance.noteWidthHalf, Math.PI, 2 * Math.PI, true)
    ctx.lineTo(this._status === 1 ? this._x + globalInstance.noteWidth + globalInstance.noteWidthDelta : this._x + globalInstance.noteWidth, this._y + globalInstance.noteHeightHalf)
    ctx.fill()
    if (connectionY > ScoreViewer.TOP_TO_TARGET_POSITION) {
      if (!SCALE) {
        ctx.drawImage(globalInstance.longMoveWhiteCanvas, targetX, targetY - globalInstance.noteHeightHalf)
      } else {
        ctx.drawImage(
          globalInstance.longMoveWhiteCanvas,
          0, 0,
          globalInstance.longMoveWhiteCanvas.width,
          globalInstance.longMoveWhiteCanvas.height,
          targetX, targetY - globalInstance.noteHeightHalf,
          globalInstance.longMoveWhiteCanvas.width / SCALE,
          globalInstance.longMoveWhiteCanvas.height / SCALE
        )
      }
    }
  }

  public drawConnection (sv: ScoreViewer): void {
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
  }

  public drawNote (sv: ScoreViewer): void {
    sv.frontCtx.drawImage(this._status === 1 ? globalInstance.flipLeftCanvas : globalInstance.flipRightCanvas, this._x, this._y)
  }

  public saveDrawConnection (sv: ScoreViewer): void {
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
          this._drawMoveConnection(sv.saveCtx, connectionX, connectionY, globalInstance.scale)
        } else {
          this._drawFlipConnection(sv.saveCtx, connectionX, connectionY)
        }
      }
    }
  }

  public saveDrawNote (sv: ScoreViewer): void {
    if (this._status === 1) {
      sv.saveCtx.drawImage(globalInstance.flipLeftCanvas, 0, 0, globalInstance.flipLeftCanvas.width, globalInstance.flipLeftCanvas.height, this._x, this._y, globalInstance.flipLeftCanvas.width / globalInstance.scale, globalInstance.flipLeftCanvas.height / globalInstance.scale)
    } else {
      sv.saveCtx.drawImage(globalInstance.flipRightCanvas, 0, 0, globalInstance.flipRightCanvas.width, globalInstance.flipRightCanvas.height, this._x, this._y, globalInstance.flipRightCanvas.width / globalInstance.scale, globalInstance.flipRightCanvas.height / globalInstance.scale)
    }
  }
}

export default FlipNote
