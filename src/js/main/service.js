import { ipcMain } from 'electron'
/* import SQL from './sqlExec.js' */
import config from './resolveConfig.js'
import onReadManifest from './onReadManifest.js'
import onReadMaster from './onReadMaster.js'
import onQueryManifest from './onQueryManifest.js'
import onAcb from './onAcb.js'
import onVoiceDec from './onVoiceDec.js'

let manifestData = {}
let manifests = []

ipcMain.on('queryManifest', (event, queryString) => {
  onQueryManifest(event, queryString, manifests)
})

ipcMain.on('readManifest', async (event, manifestFile, resVer) => {
  let obj = await onReadManifest(event, manifestFile, resVer)
  manifests = obj.manifests
  manifestData = obj.manifestData
})

ipcMain.on('readMaster', (event, masterFile) => {
  onReadMaster(event, masterFile, manifestData, config)
})

ipcMain.on('acb', (event, acbPath, arg = '') => {
  onAcb(event, acbPath, arg)
})

ipcMain.on('voiceDec', (event, acbs) => {
  onVoiceDec(event, acbs)
})

export default void 0
