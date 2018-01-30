import { app, BrowserWindow } from 'electron'
import url from 'url'
import { getPath } from './js/common/getPath.js'
import config from './js/main/ipcMain.js'

console.log(config)

let mainWindow

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1296,
    height: 863,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#000000'
  })

  mainWindow.loadURL(url.format({
    pathname: getPath('./public/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
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
