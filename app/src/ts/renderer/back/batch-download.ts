import DB from '../../common/db'
import getPath from '../../common/get-path'
import { existsSync } from 'fs-extra'
import { md5File } from './hash'
import { Downloader, ResourceType } from 'mishiro-core'
import { ipcRenderer } from 'electron'
import mainWindowId from './main-window-id'
import { extname } from 'path'

import { warn } from '../log'

const { batchDir } = getPath

const downloader = new Downloader()

interface ManifestResouceWithPath extends ManifestResouce {
  path: string
}

let stopBatch = false

async function checkFiles (manifest: DB): Promise<ManifestResouceWithPath[]> {
  warn('check')
  const records = await manifest.find<ManifestResouce>('manifests', ['name', 'hash', 'size'])

  const res: ManifestResouceWithPath[] = []

  let t = Date.now()

  for (let i = 0; i < records.length; i++) {
    const resource = records[i] as ManifestResouceWithPath
    const path = batchDir(resource.name)
    resource.path = path
    if (!existsSync(path)) {
      res.push(resource)
    } else {
      const md5 = await md5File(path)
      if (md5 !== resource.hash) {
        res.push(resource)
      }
    }
    const n = Date.now()
    if ((n >= (t + 100)) || (i === records.length - 1)) {
      t = n
      ipcRenderer.sendTo(mainWindowId, 'setBatchStatus', {
        name: 'Checking',
        status: `${i + 1} / ${records.length}`,
        curprog: 100 * (i + 1) / records.length,
        totalprog: 0
      })
    }
  }

  return res
}

let list: ManifestResouceWithPath[] = []

export async function batchDownload (manifest: DB): Promise<void> {
  list = await checkFiles(manifest)
  if (stopBatch) {
    stopBatch = false
    list.length = 0
    resetBatchStatus()
    return
  }
  for (let i = 0; i < list.length; i++) {
    const resource = list[i]
    const type = toType(resource.name)
    if (type === -1) {
      warn(`Unknown resource type: ${resource.name}`)
      continue
    }
    ipcRenderer.sendTo(mainWindowId, 'setBatchStatus', {
      name: resource.name,
      status: `${list.length}`,
      curprog: 0,
      totalprog: 100 * i / list.length
    })
    try {
      await downloader.downloadOneRaw(type, resource.hash, resource.path, (prog) => {
        ipcRenderer.sendTo(mainWindowId, 'setBatchStatus', {
          name: resource.name ?? '',
          status: `${list.length} ${formatByte(prog.current)} / ${formatByte(prog.max)}`,
          curprog: prog.loading,
          totalprog: 100 * i / list.length + prog.loading / list.length
        })
      })
    } catch (err /* cancel? */) {
      if (stopBatch) {
        break
      } else {
        throw err
      }
    }
    if (stopBatch) {
      break
    }
  }
  stopBatch = false
  list.length = 0
  resetBatchStatus()
}

export function batchStop (): Promise<void> {
  return new Promise((resolve) => {
    stopBatch = true
    list.length = 0
    downloader.stopCurrent()
    resolve()
  })
}

function resetBatchStatus (): void {
  ipcRenderer.sendTo(mainWindowId, 'setBatchStatus', {
    name: '',
    status: '',
    curprog: 0,
    totalprog: 0
  })
}

function formatByte (b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${Math.floor(b / 1024)} KB`
  if (b < 1024 * 1024 * 1024) return `${Math.floor(b / 1024 / 1024 * 100) / 100} MB`
  if (b < 1024 * 1024 * 1024 * 1024) return `${Math.floor(b / 1024 / 1024 / 1024 * 100) / 100} GB`
  return `${b}`
}

function toType (name: string): ResourceType {
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
