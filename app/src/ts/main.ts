import './common/asar'
import { app, BrowserWindow, ipcMain, Event, BrowserWindowConstructorOptions, nativeImage } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs-extra'
import * as url from 'url'
import './main/get-path'
import './main/core'
import ipc from './main/ipc'

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

let mainWindow: BrowserWindow | null

function createWindow () {
  // Menu.setApplicationMenu(null)
  const browerWindowOptions: BrowserWindowConstructorOptions = {
    width: 1296,
    height: 863,
    minWidth: 1080,
    minHeight: 700,
    show: false,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: true
    }
  }
  if ((process as any).isLinux) {
    let linuxIcon: string
    try {
      linuxIcon = require('../res/icon/1024x1024.png')
    } catch (_) {
      linuxIcon = ''
    }
    if (linuxIcon) {
      browerWindowOptions.icon = nativeImage.createFromPath(join(__dirname, linuxIcon))
    }
  } else {
    if (process.env.NODE_ENV !== 'production') {
      let icon: string = ''

      const iconPath = join(__dirname, `../src/res/icon/mishiro.${process.platform === 'win32' ? 'ico' : 'icns'}`)
      if (existsSync(iconPath)) icon = iconPath

      if (icon) {
        browerWindowOptions.icon = nativeImage.createFromPath(icon)
      }
    }
  }
  mainWindow = new BrowserWindow(browerWindowOptions)

  mainWindow.on('ready-to-show', function () {
    if (!mainWindow) return
    mainWindow.show()
    mainWindow.focus()
    if (process.env.NODE_ENV !== 'production') mainWindow.webContents.openDevTools()
  })

  // mainWindow.loadURL(url.format({
  //   pathname: getPath('./public/index.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }))

  // if (process.env.NODE_ENV === 'development') mainWindow.webContents.openDevTools()

  if (process.env.NODE_ENV !== 'production') {
    const { devServerHost, devServerPort, publicPath } = require('../../script/config.json')
    mainWindow.loadURL(`http://${devServerHost}:${devServerPort}${publicPath}`)
  } else {
    mainWindow.loadURL(url.format({
      pathname: join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))
  }

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  mainWindow.on('focus', () => {
    mainWindow && mainWindow.flashFrame(false)
  })
}

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

function main () {
  ipc()
  if (!mainWindow) createWindow()
}

app.whenReady().then(main).catch(err => console.log(err))
