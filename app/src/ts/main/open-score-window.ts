import { BrowserWindow } from 'electron'
import { format } from 'url'
import getPath from '../common/get-path'
import setIcon from './icon'

let win: BrowserWindow | null = null

export default function openScoreWindow (): void {
  if (win !== null) {
    return
  }

  win = new BrowserWindow(setIcon({
    width: 1296,
    height: 759,
    // minWidth: 1296,
    // minHeight: 759,
    // maxWidth: 1296,
    // maxHeight: 759,
    show: false,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: false,
      contextIsolation: false
    }
  }))

  win.once('ready-to-show', () => {
    win?.show()
  })

  if (process.env.NODE_ENV === 'production') {
    win.loadURL(format({
      pathname: getPath('./renderer/score.html'),
      protocol: 'file:',
      slashes: true
    })).catch(err => console.log(err))
  } else {
    win.loadURL('http://localhost:8090/app/renderer/score.html').catch(err => console.log(err))
  }

  win.on('close', () => {
    win = null
  })
}
