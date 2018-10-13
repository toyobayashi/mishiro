import './common/asar'
import { app, BrowserWindow, ipcMain, Event, BrowserWindowConstructorOptions, nativeImage } from 'electron'
import { join } from 'path'
import * as url from 'url'
import './main/get-path'
import './main/core'
import ipc from './main/ipc'

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

ipc()

let mainWindow: BrowserWindow | null

function createWindow () {
  // Menu.setApplicationMenu(null)
  const linuxIcon = require('../res/icon/mishiro.png')
  const browerWindowOptions: BrowserWindowConstructorOptions = {
    width: 1296,
    height: 863,
    minWidth: 1080,
    minHeight: 700,
    backgroundColor: '#000000'
  }
  if (process.platform === 'linux') {
    browerWindowOptions.icon = nativeImage.createFromPath(join(__dirname, linuxIcon))
  } else {
    if (process.env.NODE_ENV !== 'production') {
      browerWindowOptions.icon = process.platform === 'win32' ? nativeImage.createFromPath(join(__dirname, '../src/res/mishiro.ico')) : nativeImage.createFromPath(join(__dirname, '../src/res/traveler.icns'))
    }
  }
  mainWindow = new BrowserWindow(browerWindowOptions)

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
    mainWindow && mainWindow.flashFrame(false)
  })
}

app.whenReady().then(createWindow).catch(err => console.log(err))
// app.on('ready', createWindow)

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

ipcMain.on('flash', () => {
  mainWindow && mainWindow.flashFrame(true)
})

ipcMain.on('mainWindowId', (event: Event) => {
  event.returnValue = mainWindow && mainWindow.id
})
