import './common/asar'
import { app, BrowserWindow, ipcMain, BrowserWindowConstructorOptions, Menu, MenuItem, globalShortcut } from 'electron'
import { join } from 'path'
import * as url from 'url'
import './common/get-path'
import './main/core'
import ipc from './main/ipc'
import setIcon from './main/icon'

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

if (process.env.NODE_ENV !== 'production') {
  // https://github.com/mapbox/node-sqlite3/issues/1370
  app.allowRendererProcessReuse = false
}

let mainWindow: BrowserWindow | null = null
let backWindow: BrowserWindow | null = null

function createWindow (): void {
  const browerWindowOptions: BrowserWindowConstructorOptions = {
    width: 1296,
    height: 863,
    minWidth: 1080,
    minHeight: 700,
    show: false,
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: false,
      contextIsolation: false,
      // preload: join(__dirname, '../preload/preload.js'),
      defaultFontFamily: {
        standard: 'Microsoft YaHei'
      }
    }
  }

  setIcon(browerWindowOptions)

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

  backWindow = new BrowserWindow({
    show: true,
    // parent: mainWindow,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: false,
      contextIsolation: false
    }
  })

  backWindow.on('closed', function () {
    backWindow = null
  })

  if (process.env.NODE_ENV !== 'production') {
    mainWindow.loadURL('http://localhost:8090/app/renderer/').catch((err) => {
      console.log(err)
    })
    backWindow.loadURL('http://localhost:8090/app/renderer/back.html').catch((err) => {
      console.log(err)
    })
  } else {
    mainWindow.loadURL(url.format({
      pathname: join(__dirname, '../renderer/index.html'),
      protocol: 'file:',
      slashes: true
    })).catch((err) => {
      console.log(err)
    })

    backWindow.loadURL(url.format({
      pathname: join(__dirname, '../renderer/back.html'),
      protocol: 'file:',
      slashes: true
    })).catch((err) => {
      console.log(err)
    })
  }
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

async function main (): Promise<void> {
  await app.whenReady()
  registerGlobalShortcut()
  setMenu()
  ipc()

  ipcMain.on('flash', () => {
    mainWindow && mainWindow.flashFrame(true)
  })

  ipcMain.on('mainWindowId', (event) => {
    event.returnValue = mainWindow && mainWindow.id
  })
  ipcMain.on('backWindowId', (event) => {
    event.returnValue = backWindow && backWindow.id
  })

  if (!mainWindow) createWindow()
}

function setMenu (): void {
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

// process.on('warning', (warning) => {
//   console.log(warning.stack)
// })

main().catch(err => {
  console.error(err)
  process.exit(1)
})
