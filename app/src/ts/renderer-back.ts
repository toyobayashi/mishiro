import './renderer/preload'
import DB from './common/db'
import { batchDownload, batchStop, getBatchErrorList, setDownloaderProxy } from './renderer/back/batch-download'
// import mainWindowId from './renderer/back/main-window-id'
import readMaster from './renderer/back/on-master-read'

let manifest: DB | null = null
let master: DB | null = null

window.node.electron.ipcRenderer.on('port', e => {
  const mainWindowPort = e.ports[0]
  const portEvent = new window.node.events.EventEmitter()

  mainWindowPort.onmessage = function (event) {
    portEvent.emit('message', event)
  }

  function defineRemoteFunction (name: string, fn: (...args: any[]) => any): void {
    portEvent.on('message', (event) => {
      if (event.data.type === name) {
        Promise.resolve(fn(...event.data.payload)).then(ret => {
          mainWindowPort.postMessage({
            id: event.data.id,
            err: null,
            data: ret
          })
        }).catch(err => {
          mainWindowPort.postMessage({
            id: event.data.id,
            err: err.message,
            data: undefined
          })
        })
      }
    })
  }

  defineRemoteFunction('openManifestDatabase', async (path: string) => {
    if (manifest) {
      return
    }
    manifest = await DB.open(path)
  })

  defineRemoteFunction('openMasterDatabase', async (path: string) => {
    if (master) {
      return
    }
    master = await DB.open(path)
  })

  defineRemoteFunction('getMasterHash', async () => {
    const masterHash = (await manifest!.find('manifests', ['name', 'hash'], { name: 'master.mdb' }))[0].hash as string
    return masterHash
  })

  defineRemoteFunction('readMasterData', async (masterFile: string) => {
    master = await DB.open(masterFile)
    const masterData = await readMaster(master, manifest!)
    await master.close()
    master = null
    return masterData
  })

  defineRemoteFunction('getCardHash', async (id: string | number) => {
    const res = await manifest!.find('manifests', ['hash'], { name: `card_bg_${id}.unity3d` })
    return res[0].hash
  })

  defineRemoteFunction('getIconHash', async (id: string | number) => {
    const res = await manifest!.findOne('manifests', ['hash'], { name: `card_${id}_m.unity3d` })
    return res.hash
  })

  defineRemoteFunction('getEmblemHash', async (id: string | number) => {
    const res = await manifest!.findOne('manifests', ['hash'], { name: `emblem_${id}_l.unity3d` })
    return res.hash
  })

  defineRemoteFunction('searchResources', async (queryString: string) => {
    const res = await manifest!.find<{ name: string, hash: string }>('manifests', ['name', 'hash', 'size'], { name: { $like: `%${queryString.trim()}%` } })
    return res
  })

  let batchDownloading = false

  defineRemoteFunction('startBatchDownload', async () => {
    batchDownloading = true
    await batchDownload(mainWindowPort, manifest!)
    return batchDownloading
  })

  defineRemoteFunction('stopBatchDownload', async () => {
    await batchStop()
    batchDownloading = false
    return batchDownloading
  })

  defineRemoteFunction('getBatchErrorList', () => {
    const list = getBatchErrorList()
    return list
  })

  defineRemoteFunction('setDownloaderProxy', (proxy: string) => {
    setDownloaderProxy(proxy)
  })
})

window.addEventListener('beforeunload', () => {
  manifest?.close().catch(err => {
    console.error(err)
  })
  manifest = null
})
