import { ipcMain, Event } from 'electron'

import onManifestRead from './on-manifest-read'
import onMasterRead from './on-master-read'
import onManifestQuery from './on-manifest-query'
import onManifestSearch from './on-manifest-search'
import onGame from './on-game'

export default function () {
  let manifestData: any = {}
  let manifests: any[] = []

  ipcMain.on('queryManifest', (event: Event, queryString: string) => {
    onManifestQuery(event, queryString, manifests)
  })

  ipcMain.on('searchManifest', (event: Event, queryString: string) => {
    onManifestSearch(event, queryString, manifests)
  })

  ipcMain.on('readManifest', async (event: Event, manifestFile: string, resVer: number) => {
    let obj = await onManifestRead(event, manifestFile, resVer)
    manifests = obj.manifests
    manifestData = obj.manifestData
  })

  ipcMain.on('readMaster', (event: Event, masterFile: string) => {
    onMasterRead(event, masterFile, manifestData, configurer.getConfig(), manifests)
  })

  ipcMain.on('game', (event: Event, scoreFile: string, difficulty: string, bpm: number, audioFile: string) => {
    onGame(event, scoreFile, difficulty, bpm, audioFile)
  })
}
