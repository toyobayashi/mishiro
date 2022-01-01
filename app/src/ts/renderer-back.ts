import './renderer/preload'
import { ipcRenderer } from 'electron'
import DB from './common/db'
import { batchDownload, batchStop, getBatchErrorList, setDownloaderProxy } from './renderer/back/batch-download'
import mainWindowId from './renderer/back/main-window-id'
import readMaster from './renderer/back/on-master-read'

let manifest: DB | null = null
let master: DB | null = null

ipcRenderer.on('openManifestDatabase', async (event, callbackChannel: string, path: string) => {
  if (manifest) {
    event.sender.sendTo(mainWindowId, callbackChannel, null)
    return
  }
  try {
    manifest = await DB.open(path)
    event.sender.sendTo(mainWindowId, callbackChannel, null)
  } catch (err) {
    event.sender.sendTo(mainWindowId, callbackChannel, err.message)
  }
})

ipcRenderer.on('openMasterDatabase', async (event, callbackChannel: string, path: string) => {
  if (master) {
    event.sender.sendTo(mainWindowId, callbackChannel, null)
    return
  }
  try {
    master = await DB.open(path)
    event.sender.sendTo(mainWindowId, callbackChannel, null)
  } catch (err) {
    event.sender.sendTo(mainWindowId, callbackChannel, err.message)
  }
})

ipcRenderer.on('getMasterHash', async (event, callbackChannel: string) => {
  try {
    const masterHash = (await manifest!.find('manifests', ['name', 'hash'], { name: 'master.mdb' }))[0].hash as string
    event.sender.sendTo(mainWindowId, callbackChannel, null, masterHash)
  } catch (err) {
    event.sender.sendTo(mainWindowId, callbackChannel, err.message, '')
  }
})

ipcRenderer.on('readMasterData', async (event, callbackChannel: string, masterFile: string) => {
  try {
    master = await DB.open(masterFile)
    const masterData = await readMaster(master, manifest!)
    await master.close()
    master = null
    event.sender.sendTo(mainWindowId, callbackChannel, null, masterData)
  } catch (err) {
    event.sender.sendTo(mainWindowId, callbackChannel, err.message, '')
  }
})

ipcRenderer.on('getCardHash', async (event, callbackChannel: string, id: string | number) => {
  try {
    const res = await manifest!.find('manifests', ['hash'], { name: `card_bg_${id}.unity3d` })
    event.sender.sendTo(mainWindowId, callbackChannel, null, res[0].hash)
  } catch (err) {
    event.sender.sendTo(mainWindowId, callbackChannel, err.message, '')
  }
})

ipcRenderer.on('getIconHash', async (event, callbackChannel: string, id: string | number) => {
  try {
    const res = await manifest!.findOne('manifests', ['hash'], { name: `card_${id}_m.unity3d` })
    event.sender.sendTo(mainWindowId, callbackChannel, null, res.hash)
  } catch (err) {
    event.sender.sendTo(mainWindowId, callbackChannel, err.message, '')
  }
})

ipcRenderer.on('getEmblemHash', async (event, callbackChannel: string, id: string | number) => {
  try {
    const res = await manifest!.findOne('manifests', ['hash'], { name: `emblem_${id}_l.unity3d` })
    event.sender.sendTo(mainWindowId, callbackChannel, null, res.hash)
  } catch (err) {
    event.sender.sendTo(mainWindowId, callbackChannel, err.message, '')
  }
})

ipcRenderer.on('searchResources', async (event, callbackChannel: string, queryString: string) => {
  try {
    const res = await manifest!.find<{ name: string, hash: string }>('manifests', ['name', 'hash', 'size'], { name: { $like: `%${queryString.trim()}%` } })
    event.sender.sendTo(mainWindowId, callbackChannel, null, res)
  } catch (err) {
    event.sender.sendTo(mainWindowId, callbackChannel, err.message, '')
  }
})

let batchDownloading = false

ipcRenderer.on('startBatchDownload', async (event, callbackChannel: string) => {
  try {
    batchDownloading = true
    await batchDownload(manifest!)
    event.sender.sendTo(mainWindowId, callbackChannel, null, batchDownloading)
  } catch (err) {
    event.sender.sendTo(mainWindowId, callbackChannel, err.message, '')
  }
})

ipcRenderer.on('stopBatchDownload', async (event, callbackChannel: string) => {
  try {
    await batchStop()
    batchDownloading = false
    event.sender.sendTo(mainWindowId, callbackChannel, null, batchDownloading)
  } catch (err) {
    event.sender.sendTo(mainWindowId, callbackChannel, err.message, '')
  }
})

ipcRenderer.on('getBatchErrorList', (event, callbackChannel: string) => {
  try {
    const list = getBatchErrorList()
    event.sender.sendTo(mainWindowId, callbackChannel, null, list)
  } catch (err) {
    event.sender.sendTo(mainWindowId, callbackChannel, err.message, null)
  }
})

ipcRenderer.on('setDownloaderProxy', (event, callbackChannel: string, proxy: string) => {
  try {
    setDownloaderProxy(proxy)
    event.sender.sendTo(mainWindowId, callbackChannel, null)
  } catch (err) {
    event.sender.sendTo(mainWindowId, callbackChannel, err.message)
  }
})

window.addEventListener('beforeunload', () => {
  manifest?.close().catch(err => {
    console.error(err)
  })
  manifest = null
})
