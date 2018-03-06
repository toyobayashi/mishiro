import { app, BrowserWindow, ipcMain } from 'electron'
import url from 'url'
import getPath from './common/getPath.js'
import './main/service.js'

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1296,
    height: 863,
    minWidth: 1080,
    minHeight: 700,
    backgroundColor: '#000000'
  })

  mainWindow.loadURL(url.format({
    pathname: getPath('./public/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.on('focus', () => {
    mainWindow.flashFrame(false)
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('flash', (event) => {
  mainWindow.flashFrame(true)
})
