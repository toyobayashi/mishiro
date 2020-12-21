import DB from '../common/db'
import getPath from './get-path'
import { existsSync } from 'fs-extra'
import { md5File } from './hash'

const { batchDir } = getPath

interface ManifestResouceWithPath extends ManifestResouce {
  path: string
}

async function checkFiles (): Promise<ManifestResouceWithPath[]> {
  // TODO
  const { getCache } = __non_webpack_require__('./export.js')
  const manifest: DB | undefined = getCache('manifestDB')
  if (!manifest) {
    return []
  }
  console.time('read')
  const records = await manifest.find<ManifestResouce>('manifests', ['name', 'hash', 'size'])
  console.timeEnd('read')

  const res: ManifestResouceWithPath[] = []

  console.time('check')
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
  }
  console.timeEnd('check')

  return res
}

async function batchDownload (): Promise<void> {
  await checkFiles()
  // TODO
}

export default batchDownload
