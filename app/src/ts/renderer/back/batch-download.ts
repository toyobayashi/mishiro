import type DB from '../../common/db'
import { formatSize } from '../../common/util'
import getPath from '../../common/get-path'
import { md5File } from './hash'
import type { DownloadPromise, ResourceType as ResourceTypeEnum } from 'mishiro-core'
// import { ipcRenderer } from 'electron'
// import mainWindowId from './main-window-id'
import { warn } from '../log'
import configurer from '../config'

const { existsSync, removeSync } = window.node.fs
const { extname, basename } = window.node.path
const { Downloader, ResourceType } = window.node.mishiroCore

const { batchDir } = getPath

const downloader = new Downloader()
downloader.setProxy(configurer.get('proxy') ?? '')

interface ManifestResouceWithPath extends ManifestResouce {
  path: string
}

let stopBatch = false

async function checkFiles (port: MessagePort, manifest: DB): Promise<{
  list: ManifestResouceWithPath[]
  count: number
}> {
  const records = await manifest.find<ManifestResouce>('manifests', ['name', 'hash', 'size'])

  const res: ManifestResouceWithPath[] = []

  let t = Date.now()

  let completeCount = 0

  for (let i = 0; i < records.length; i++) {
    const resource = records[i] as ManifestResouceWithPath
    const path = batchDir(resource.name)
    resource.path = path
    if (!existsSync(path)) {
      res.push(resource)
    } else {
      const md5 = await md5File(path)
      if (md5 !== resource.hash) {
        removeSync(path)
        res.push(resource)
      } else {
        completeCount++
      }
    }
    const n = Date.now()
    if ((n >= (t + 100)) || (i === records.length - 1)) {
      t = n
      port.postMessage({
        type: 'setBatchStatus',
        payload: [{
          name: 'Checking',
          status: `${i + 1} / ${records.length}`,
          status2: `${completeCount} / ${records.length}`,
          curprog: 100 * (i + 1) / records.length,
          totalprog: 0
        }]
      })
    }
  }

  return {
    list: res,
    count: records.length - res.length
  }
}

let list: ManifestResouceWithPath[] = []
let currentDownloadPromise: DownloadPromise<string> | null = null
let errorList: IBatchError[] = []

export function getBatchErrorList (): IBatchError[] {
  return errorList
}

export function setDownloaderProxy (proxy: string): void {
  downloader.setProxy(proxy)
}

export async function batchDownload (port: MessagePort, manifest: DB): Promise<void> {
  errorList = []
  const info = await checkFiles(port, manifest)
  list = info.list
  const count = info.count
  const totalCount = list.length + count
  if (stopBatch) {
    stopBatch = false
    list.length = 0
    resetBatchStatus(port)
    return
  }
  for (let i = 0; i < list.length; i++) {
    const resource = list[i]
    const type = toType(resource.name)
    if (type === -1) {
      warn(`Unknown resource type: ${resource.name}`)
      continue
    }
    const status2 = `${i + count} / ${totalCount}`
    port.postMessage({
      type: 'setBatchStatus',
      payload: [{
        name: resource.name,
        status: '',
        status2: status2,
        curprog: 0,
        totalprog: 100 * (i + count) / totalCount
      }]
    })
    try {
      currentDownloadPromise = downloader.downloadOneRaw(type, resource.hash, resource.path, (prog) => {
        port.postMessage({
          type: 'setBatchStatus',
          payload: [{
            name: resource.name ?? '',
            status: `${formatSize(prog.current)} / ${formatSize(prog.max)}`,
            status2: status2,
            curprog: prog.loading,
            totalprog: 100 * (i + count) / totalCount + prog.loading / totalCount
          }]
        })
      })
      await currentDownloadPromise
      currentDownloadPromise = null
    } catch (err: any) {
      if (stopBatch) {
        currentDownloadPromise = null
        break
      } else {
        const name = basename(currentDownloadPromise?.download.path ?? '')
        errorList.push({
          path: name,
          message: err.message,
          code: err.code ?? currentDownloadPromise?.download.error?.code ?? -1
        })
        currentDownloadPromise = null
      }
    }
    if (stopBatch) {
      currentDownloadPromise = null
      break
    }
  }
  stopBatch = false
  list.length = 0
  resetBatchStatus(port)
}

export function batchStop (): Promise<void> {
  return new Promise((resolve) => {
    stopBatch = true
    list.length = 0
    currentDownloadPromise?.download.abort()
    resolve()
  })
}

function resetBatchStatus (port: MessagePort): void {
  port.postMessage({
    type: 'setBatchStatus',
    payload: [{
      name: '',
      status: '',
      status2: '',
      curprog: 0,
      totalprog: 0
    }]
  })
}

function toType (name: string): ResourceTypeEnum | -1 {
  const ext = extname(name)
  switch (ext) {
    case '.unity3d': return ResourceType.ASSET
    case '.acb':
    case '.awb':
      return ResourceType.SOUND
    case '.bdb':
    case '.mdb':
      return ResourceType.DATABASE
    case '.usm':
      return ResourceType.MOVIE
    default:
      return -1
  }
}
