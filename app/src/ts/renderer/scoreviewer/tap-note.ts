import { globalInstance } from './global'
import type { ScoreNote } from '../../main/on-score'
import Note from './note'
import type ScoreViewer from './score-viewer'

class TapNote extends Note {
  constructor (note: ScoreNote, syncNote?: ScoreNote) {
    super(note)
    if (syncNote) this._synchronizedNote = syncNote
  }

  public drawConnection (_sv: ScoreViewer): void {
    // empty
  }

  public drawNote (sv: ScoreViewer): void {
    sv.frontCtx.drawImage(globalInstance.tapCanvas, this._x, this._y)
  }

  public saveDrawConnection (_sv: ScoreViewer): void {
    // empty
  }

  public saveDrawNote (sv: ScoreViewer): void {
    sv.saveCtx.drawImage(globalInstance.tapCanvas, 0, 0, globalInstance.tapCanvas.width, globalInstance.tapCanvas.height, this._x, this._y, globalInstance.tapCanvas.width / globalInstance.scale, globalInstance.tapCanvas.height / globalInstance.scale/* ScoreViewer.calY(sv.options.speed, this._sec, 0) */)
  }
}

export default TapNote
