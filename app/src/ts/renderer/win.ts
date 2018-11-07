import { remote, BrowserWindow, ipcRenderer } from 'electron'
import getPath from './get-path'
import { format } from 'url'

let id = ipcRenderer.sendSync('mainWindowId')

let win: BrowserWindow | null = new remote.BrowserWindow({ width: 346, height: 346, show: false/* process.env.NODE_ENV !== 'production' */, parent: remote.BrowserWindow.fromId(id) })

win.loadURL(format({
  pathname: getPath('./public/back.html'),
  protocol: 'file:',
  slashes: true
}))

window.addEventListener('beforeunload', () => {
  if (win) win.close()
  win = null
})

export function unpackTexture2D (assetbundle: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    let randomId = (Math.round(Math.random() * 346346) + new Date().getTime()).toString()
    ipcRenderer.once(randomId, (_event: Event, err: { message: string; stack?: string } | null, pngs: string[]) => {
      if (err) {
        const newErr = new Error()
        newErr.message = err.message
        newErr.stack = err.stack
        return reject(newErr)
      }
      resolve(pngs)
    });

    (win as BrowserWindow).webContents.send('texture2d', assetbundle, randomId, id)
  })
}
