import { ipcMain } from 'electron'
import * as Updater from 'electron-github-asar-updater'

const updater = new Updater('toyobayashi/mishiro', 'resources')

export function updaterIpc (): void {
  ipcMain.on('updater#relaunch', (event) => {
    updater.relaunch()
    event.returnValue = undefined
  })

  ipcMain.on('updater#getUpdateInfo', (event) => {
    event.returnValue = updater.getUpdateInfo()
  })

  ipcMain.on('updater#abort', (event) => {
    updater.abort()
    event.returnValue = undefined
  })

  ipcMain.handle('updater#check', async (_event, options) => {
    return updater.check(options)
  })

  ipcMain.handle('updater#download', async (event) => {
    return updater.download((progress) => {
      event.sender.send('updater#onDownloadProgress', progress)
    })
  })
}
