import './renderer/preload'
import '../css/mishiro.css'
import '../css/game.css'
import ScoreViewer from './renderer/scoreviewer/score-viewer'

ScoreViewer.main()

if (process.env.NODE_ENV !== 'production') {
  if ((module as any).hot) (module as any).hot.accept()
}
