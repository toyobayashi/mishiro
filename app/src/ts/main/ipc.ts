import { ipcMain, Event } from 'electron'
import onManifestRead from './on-manifest-read'
import onMasterRead, { MasterData } from './on-master-read'
import onManifestQuery from './on-manifest-query'
import onManifestSearch from './on-manifest-search'
import onGame from './on-game'
import onScore from './on-score'
import onCheckScore from './on-check-score'
import onLyrics from './on-lyrics'
import { existsSync } from 'fs-extra'
import getPath from './get-path'
import { basename } from 'path'

let initialized = false

export default function ipc () {
  if (initialized) return

  let manifestData: any = {}
  let manifests: any[] = []
  let version: number = -1
  let masterHash: string = ''
  let masterData: MasterData

  ipcMain.on('queryManifest', (event: Event, queryString: string) => {
    onManifestQuery(event, queryString, manifests)
  })

  ipcMain.on('searchManifest', (event: Event, queryString: string) => {
    onManifestSearch(event, queryString, manifests)
  })

  ipcMain.on('readManifest', async (event: Event, manifestFile: string, resVer: number) => {
    if (version !== resVer || !manifests.length) {
      let obj = await onManifestRead(manifestFile)
      manifests = obj.manifests
      manifestData = obj.manifestData
      masterHash = obj.masterHash
      version = resVer
    }
    event.sender.send('readManifest', masterHash, resVer)
  })

  ipcMain.on('readMaster', async (event: Event, masterFile: string, resVer: number) => {
    if (version !== resVer || !masterData) {
      masterData = await onMasterRead(masterFile, manifestData, configurer.getConfig(), manifests)
    }
    event.sender.send('readMaster', masterData)
  })

  ipcMain.on('game', (event: Event, scoreFile: string, difficulty: string, bpm: number, audioFile: string) => {
    onGame(event, scoreFile, difficulty, bpm, audioFile).catch(err => console.log(err))
  })

  ipcMain.on('checkScore', (event: Event, objectId: string, scoreFile: string) => {
    onCheckScore(event, objectId, scoreFile).catch(err => console.log(err))
  })

  ipcMain.on('score', (event: Event, scoreFile: string, difficulty: string, bpm: number, audioFile: string) => {
    onScore(event, scoreFile, difficulty, bpm, audioFile).catch(err => console.log(err))
  })

  ipcMain.on('lyrics', (event: Event, scoreFile: string) => {
    onLyrics(event, scoreFile).catch(err => console.log(err))
  })

  ipcMain.on('checkFile', (event: Event, id: string, manifest: any[]) => {
    event.sender.send('checkFile', id, manifest.filter(row => !existsSync(getPath.downloadDir(basename(row.name)))))
  })

  initialized = true
}
