import './common/asar'
import { app, BrowserWindow, ipcMain, BrowserWindowConstructorOptions, nativeImage } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs-extra'
import * as url from 'url'
import './main/get-path'
import './main/core'
import ipc from './main/ipc'

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

let mainWindow: BrowserWindow | null

function createWindow (): void {
  // Menu.setApplicationMenu(null)
  const browerWindowOptions: BrowserWindowConstructorOptions = {
    width: 1296,
    height: 863,
    minWidth: 1080,
    minHeight: 700,
    show: false,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      preload: join(__dirname, '../preload/preload.js'),
      defaultFontFamily: {
        standard: 'Microsoft YaHei'
      }
    }
  }
  if (process.platform === 'linux') {
    let linuxIcon: string
    try {
      linuxIcon = join(__dirname, '../../icon/1024x1024.png')
    } catch (_) {
      linuxIcon = ''
    }
    if (linuxIcon) {
      browerWindowOptions.icon = nativeImage.createFromPath(join(__dirname, linuxIcon))
    }
  } else {
    if (process.env.NODE_ENV !== 'production') {
      let icon: string = ''

      const iconPath = join(__dirname, `../../../src/res/icon/app.${process.platform === 'win32' ? 'ico' : 'icns'}`)
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

  mainWindow.on('closed', function () {
    mainWindow = null
    app.quit()
  })

  mainWindow.on('focus', () => {
    mainWindow && mainWindow.flashFrame(false)
  })

  if (process.env.NODE_ENV !== 'production') {
    // const config = require('../../script/config').default
    const res: any = mainWindow.loadURL('http://localhost:8090/app/renderer/')

    if (res !== undefined && typeof res.then === 'function' && typeof res.catch === 'function') {
      res.catch((err: Error) => {
        console.log(err)
      })
    }
  } else {
    (mainWindow as any).removeMenu ? (mainWindow as any).removeMenu() : mainWindow.setMenu(null)
    const res: any = mainWindow.loadURL(url.format({
      pathname: join(__dirname, '../renderer/index.html'),
      protocol: 'file:',
      slashes: true
    }))

    if (res !== undefined && typeof res.then === 'function' && typeof res.catch === 'function') {
      res.catch((err: Error) => {
        console.log(err)
      })
    }
  }
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

ipcMain.on('mainWindowId', (event) => {
  event.returnValue = mainWindow && mainWindow.id
})

// tslint:disable-next-line: strict-type-predicates
typeof (app as any).whenReady === 'function' ? (app as any).whenReady().then(main) : app.on('ready', main)

function main (): void {
  ipc()
  if (!mainWindow) createWindow()
}
