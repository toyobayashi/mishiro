import { ipcMain } from 'electron'
/* import SQL from './sql-exec.js' */
import config from './resolve-config.js'
import onManifestRead from './on-manifest-read.js'
import onMasterRead from './on-master-read.js'
import onManifestQuery from './on-manifest-query.js'
import onAcb from './on-acb.js'
import onVoiceDecode from './on-voice-decode.js'
import onGame from './on-game.js'
// import onTitleVoiceDecode from './on-title-voice-decode.js'

let manifestData = {}
let manifests = []

ipcMain.on('queryManifest', (event, queryString) => {
  onManifestQuery(event, queryString, manifests)
})

ipcMain.on('readManifest', async (event, manifestFile, resVer) => {
  let obj = await onManifestRead(event, manifestFile, resVer)
  manifests = obj.manifests
  manifestData = obj.manifestData
})

ipcMain.on('readMaster', (event, masterFile) => {
  onMasterRead(event, masterFile, manifestData, config)
})

ipcMain.on('acb', (event, acbPath, arg = '') => {
  onAcb(event, acbPath, arg)
})

ipcMain.on('voiceDec', (event, acbs) => {
  onVoiceDecode(event, acbs)
})

ipcMain.on('game', (event, scoreFile, difficulty, bpm, audioFile) => {
  onGame(event, scoreFile, difficulty, bpm, audioFile)
})

/* ipcMain.on('titleVoiceDec', (event, acbs) => {
  onTitleVoiceDecode(event, acbs)
}) */

export default void 0
