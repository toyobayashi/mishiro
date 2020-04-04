import './common/asar'
import { app, BrowserWindow, ipcMain, BrowserWindowConstructorOptions, nativeImage, Menu, MenuItem, globalShortcut } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs-extra'
import * as url from 'url'
import './main/get-path'
import './main/core'
import ipc from './main/ipc'

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

let mainWindow: BrowserWindow | null

function createWindow (): void {
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

      const iconPath = join(__dirname, `../../../src/res/icon/${process.platform === 'darwin' ? '1024x1024.png' : 'app.ico'}`)
      if (existsSync(iconPath)) icon = iconPath

      if (icon) {
        if (process.platform === 'darwin') {
          app.dock.setIcon(icon)
        } else {
          browerWindowOptions.icon = nativeImage.createFromPath(icon)
        }
      }
    }
  }
  mainWindow = new BrowserWindow(browerWindowOptions)

  mainWindow.on('ready-to-show', function () {
    if (!mainWindow) return
    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', function () {
    mainWindow = null
    app.quit()
  })

  mainWindow.on('focus', () => {
    mainWindow && mainWindow.flashFrame(false)
  })

  if (process.platform !== 'darwin') {
    (mainWindow as any).removeMenu ? (mainWindow as any).removeMenu() : mainWindow.setMenu(null)
  }

  if (process.env.NODE_ENV !== 'production') {
    const res: any = mainWindow.loadURL('http://localhost:8090/app/renderer/')

    if (res !== undefined && typeof res.then === 'function' && typeof res.catch === 'function') {
      res.catch((err: Error) => {
        console.log(err)
      })
    }
  } else {
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

typeof (app as any).whenReady === 'function' ? (app as any).whenReady().then(main) : app.on('ready', main)

function main (): void {
  registerGlobalShortcut()
  if (process.platform === 'darwin') {
    const template: MenuItem[] = [
      new MenuItem({
        label: app.name,
        submenu: [
          { role: 'quit' }
        ]
      })
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }
  ipc()
  if (!mainWindow) createWindow()
}

function registerGlobalShortcut (): void {
  globalShortcut.register('CommandOrControl+Shift+I', function () {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      if (win.webContents.isDevToolsOpened()) {
        win.webContents.closeDevTools()
      } else {
        win.webContents.openDevTools()
      }
    }
  })

  if (process.env.NODE_ENV !== 'production') {
    globalShortcut.register('CommandOrControl+R', function () {
      const win = BrowserWindow.getFocusedWindow()
      if (win) {
        win.webContents.reload()
      }
    })
  }
}
