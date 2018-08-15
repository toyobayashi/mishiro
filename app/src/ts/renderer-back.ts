import './asar'
import { ipcRenderer, remote, Event } from 'electron'
import { util } from 'mishiro-core'
import { removeSync } from 'fs-extra'

const BrowserWindow = remote.BrowserWindow
ipcRenderer.on('texture2d', (_event: Event, assetbundle: string, randomId: string, fromWindowId: number) => {
  const fromWindow = BrowserWindow.fromId(fromWindowId)
  util.unpackTexture2D(assetbundle).then(result => {
    removeSync(assetbundle)
    fromWindow.webContents.send(randomId, null, result)
  }).catch(e => {
    fromWindow.webContents.send(randomId, e, [])
  })
})
