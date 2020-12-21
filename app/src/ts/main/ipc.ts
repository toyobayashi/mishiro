import { ipcMain, SaveDialogOptions, dialog } from 'electron'
import readManifest from './on-manifest-read'
import readMaster, { MasterData } from './on-master-read'
// import onManifestQuery from './on-manifest-query'
// import onManifestSearch from './on-manifest-search'
// import onGame from './on-game'
import getScore from './on-score'
import getScoreDifficulties from './on-check-score'
import getLyrics from './on-lyrics'
// import { existsSync } from 'fs-extra'
// import getPath from './get-path'
// import configurer from './config'

import batchDownload from './batch-download'
import openScoreWindow from './open-score-window'

let initialized = false

export default function ipc (): void {
  if (initialized) return

  const { setCache } = __non_webpack_require__('./export.js')

  // let manifestData: any = {}
  // let manifests: any[] = []
  // let version: number = -1
  // let masterHash: string = ''
  let masterData: MasterData

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

  ipcMain.on('readMaster', async (event, masterFile: string/* , resVer: number */) => {
    if (!masterData) {
      masterData = await readMaster(masterFile/* , configurer.getConfig(), manifests */)
    }
    event.sender.send('readMaster', masterData)
  })

  ipcMain.on('batchDownload', async () => {
    // TODO
    await batchDownload()
  })

  ipcMain.handle('showSaveDialog', (_event, options: SaveDialogOptions) => {
    return dialog.showSaveDialog(options)
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
  setCache('getScore', getScore)
  setCache('getScoreDifficulties', getScoreDifficulties)
  setCache('getLyrics', getLyrics)
  setCache('readManifest', readManifest)
  // setCache('readMaster', readMaster)
  // setCache('queryManifest', function queryManifest (queryString: string) {
  //   const manifestArr = []
  //   for (let i = 0; i < manifests.length; i++) {
  //     if (manifests[i].name.indexOf(queryString) !== -1) {
  //       manifestArr.push(manifests[i])
  //     }
  //   }
  //   return manifestArr
  // })

  // ipcMain.on('lyrics', (event: Event, scoreFile: string) => {
  //   onLyrics(event, scoreFile).catch(err => console.log(err))
  // })

  // ipcMain.on('checkFile', (event: Event, id: string, manifest: any[]) => {
  //   event.sender.send('checkFile', id, manifest.filter(row => !existsSync(getPath.downloadDir(basename(row.name)))))
  // })

  initialized = true
}
