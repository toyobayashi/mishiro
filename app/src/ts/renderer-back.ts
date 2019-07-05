import './common/asar'
import { ipcRenderer, remote, Event } from 'electron'
import { util } from 'mishiro-core'
import fs from './renderer/fs'

const BrowserWindow = remote.BrowserWindow
ipcRenderer.on('texture2d', (_event: Event, assetbundle: string, randomId: string, fromWindowId: number) => {
  const fromWindow = BrowserWindow.fromId(fromWindowId)
  util.unpackTexture2D(assetbundle).then(result => {
    fs.removeSync(assetbundle)
    fromWindow.webContents.send(randomId, null, result)
  }).catch(e => {
    fromWindow.webContents.send(randomId, {
      message: e.message,
      stack: e.stack
    }, [])
  })
})
