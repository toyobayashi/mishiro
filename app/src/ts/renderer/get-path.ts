import { ipcRenderer } from 'electron'
import { GetPath } from '../main/get-path'

function createGetPathFunction (name: string): (...relative: string[]) => string {
  return function (...relative) {
    return ipcRenderer.sendSync('getPath', name, ...relative)
  }
}

const _getPath = createGetPathFunction('')

const getPath: GetPath = function (...relative: string[]): string {
  return _getPath(...relative)
}
getPath.configPath = null!

Object.defineProperty(getPath, 'configPath', {
  enumerable: true,
  configurable: true,
  get () {
    return _getPath('../config.json')
  }
})

getPath.dataDir = createGetPathFunction('dataDir')
getPath.manifestPath = createGetPathFunction('manifestPath') as any
getPath.masterPath = createGetPathFunction('masterPath') as any
getPath.downloadDir = createGetPathFunction('downloadDir')
getPath.iconDir = createGetPathFunction('iconDir')
getPath.emblemDir = createGetPathFunction('emblemDir')
getPath.cardDir = createGetPathFunction('cardDir')
getPath.scoreDir = createGetPathFunction('scoreDir')
getPath.voiceDir = createGetPathFunction('voiceDir')
getPath.bgmDir = createGetPathFunction('bgmDir')
getPath.liveDir = createGetPathFunction('liveDir')
getPath.jacketDir = createGetPathFunction('jacketDir')
getPath.batchDir = createGetPathFunction('batchDir')

export default getPath
