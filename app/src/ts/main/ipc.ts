import { ipcMain, Event } from 'electron'

import onManifestRead from './on-manifest-read'
import onMasterRead from './on-master-read'
import onManifestQuery from './on-manifest-query'
import onManifestSearch from './on-manifest-search'
import onAcb from './on-acb'
import onVoiceDecode from './on-voice-decode'
import onGame from './on-game'

// import { configurer } from '*global';
// import onTitleVoiceDecode from './on-title-voice-decode.js'

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

  ipcMain.on('acb', (event: Event, acbPath: string, arg: string = '') => {
    onAcb(event, acbPath, arg)
  })

  ipcMain.on('voiceDec', (event: Event, acbs: string[]) => {
    onVoiceDecode(event, acbs)
  })

  ipcMain.on('game', (event: Event, scoreFile: string, difficulty: string, bpm: number, audioFile: string) => {
    onGame(event, scoreFile, difficulty, bpm, audioFile)
  })

  /* ipcMain.on('titleVoiceDec', (event, acbs) => {
    onTitleVoiceDecode(event, acbs)
  }) */
}
