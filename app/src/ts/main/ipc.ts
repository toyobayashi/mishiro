import { ipcMain, SaveDialogOptions, dialog, app, RelaunchOptions } from 'electron'
// import onManifestQuery from './on-manifest-query'
// import onManifestSearch from './on-manifest-search'
// import onGame from './on-game'
import getScore from './on-score'
import getScoreDifficulties from './on-check-score'
import getLyrics from './on-lyrics'
// import { existsSync } from 'fs-extra'
// import getPath from './get-path'
// import configurer from './config'

// import batchDownload from './batch-download'
import openScoreWindow from './open-score-window'
import configurer, { Configurer } from './config'
import { client } from './core'
import { updaterIpc } from './updater'
import * as log from './log'

let initialized = false

function registerIpcConfig (configurer: Configurer): void {
  ipcMain.on('configurer#getAll', (event) => {
    event.returnValue = configurer.getAll()
  })

  ipcMain.on('configurer#get', (event, key) => {
    event.returnValue = configurer.get(key)
  })

  ipcMain.on('configurer#set', (event, key, value) => {
    configurer.set(key, value)
    event.returnValue = undefined
  })

  ipcMain.on('configurer#remove', (event, key) => {
    event.returnValue = configurer.remove(key)
    event.returnValue = undefined
  })
}

export default function ipc (): void {
  if (initialized) return

  // let manifestData: any = {}
  // let manifests: any[] = []
  // let version: number = -1
  // let masterHash: string = ''

  // ipcMain.on('queryManifest', (event: Event, queryString: string) => {
  //   onManifestQuery(event, queryString, manifests)
  // })

  // ipcMain.on('searchManifest', (event: Event, queryString: string) => {
  //   onManifestSearch(event, queryString, manifests)
  // })

  // ipcMain.on('readManifest', async (event: Event, manifestFile: string, resVer: number) => {
  //   if (version !== resVer || !manifests.length) {
  //     let obj = await onManifestRead(manifestFile)
  //     manifests = obj.manifests
  //     manifestData = obj.manifestData
  //     masterHash = obj.masterHash
  //     version = resVer
  //   }
  //   event.sender.send('readManifest', masterHash, resVer)
  // })

  ipcMain.on('openScoreWindow', function () {
    openScoreWindow()
  })

  ipcMain.on('batchDownload', async () => {
    // TODO
    // await batchDownload()
  })

  ipcMain.handle('showSaveDialog', (_event, options: SaveDialogOptions) => {
    return dialog.showSaveDialog(options)
  })

  ipcMain.on('relaunch', (event, options: RelaunchOptions | undefined) => {
    event.returnValue = app.relaunch(options)
  })

  ipcMain.on('exit', (event, exitCode?: number) => {
    event.returnValue = app.exit(exitCode)
  })

  ipcMain.on('appName', (event) => {
    event.returnValue = app.name
  })

  ipcMain.on('appVersion', (event) => {
    event.returnValue = app.getVersion()
  })

  ipcMain.on('package.json', (event) => {
    event.returnValue = __non_webpack_require__('../package.json')
  })

  ipcMain.handle('checkResourceVersion', async () => {
    const res = await client.check()
    if (res !== 0) {
      const latestResVer = configurer.get('latestResVer')
      if (!latestResVer || (res > latestResVer)) {
        console.log(`/load/check [New Version] ${latestResVer} => ${res}`)
      } else {
        console.log(`/load/check [Latest Version] ${res}`)
      }
      configurer.set('latestResVer', res)
      client.resVer = res.toString()
    } else {
      console.log('/load/check failed')
    }
    return res
  })

  ipcMain.handle('getProfile', async (_event, viewer: string) => {
    return client.getProfile(viewer)
  })

  registerIpcConfig(configurer)
  updaterIpc()

  ipcMain.on('log', (event, level: keyof typeof log, msg: string) => {
    log[level](msg)
    event.returnValue = undefined
  })

  // ipcMain.on('game', (event: Event, scoreFile: string, difficulty: string, bpm: number, audioFile: string) => {
  //   onGame(event, scoreFile, difficulty, bpm, audioFile).catch(err => console.log(err))
  // })

  // ipcMain.on('checkScore', (event: Event, objectId: string, scoreFile: string) => {
  //   onCheckScore(event, objectId, scoreFile).catch(err => console.log(err))
  // })

  // ipcMain.on('score', (event: Event, scoreFile: string, difficulty: string, bpm: number, audioFile: string) => {
  //   onScore(event, scoreFile, difficulty, bpm, audioFile).catch(err => console.log(err))
  // })

  ipcMain.handle('getScore', async (_event, scoreFile: string, difficulty: number | string, bpm: number, src: string) => {
    return getScore(scoreFile, difficulty, bpm, src)
  })
  ipcMain.handle('getScoreDifficulties', async (_event, scoreFile: string) => {
    return getScoreDifficulties(scoreFile)
  })
  ipcMain.handle('getLyrics', async (_event, scoreFile: string) => {
    return getLyrics(scoreFile)
  })

  initialized = true
}
