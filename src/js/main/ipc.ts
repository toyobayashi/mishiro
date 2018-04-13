import { ipcMain } from 'electron'
/* import SQL from './sql-exec.js' */
// import config from './resolve-config.js'
import { config } from './client'
import onManifestRead from './on-manifest-read.js'
import onMasterRead from './on-master-read.js'
import onManifestQuery from './on-manifest-query.js'
import onAcb from './on-acb.js'
import onVoiceDecode from './on-voice-decode.js'
import onGame from './on-game.js'
// import onTitleVoiceDecode from './on-title-voice-decode.js'

let manifestData: object = {}
let manifests: object[] = []

ipcMain.on('queryManifest', (event: Event, queryString: string) => {
  onManifestQuery(event, queryString, manifests)
})

ipcMain.on('readManifest', async (event: Event, manifestFile: string, resVer: number) => {
  let obj = await onManifestRead(event, manifestFile, resVer)
  manifests = obj.manifests
  manifestData = obj.manifestData
})

ipcMain.on('readMaster', (event: Event, masterFile: string) => {
  onMasterRead(event, masterFile, manifestData, config)
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

export default void 0
