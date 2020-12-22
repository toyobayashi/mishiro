import { join } from 'path'

export interface GetPath {
  (...relative: string[]): string
  configPath: string
  logPath: string
  dataDir: (...relative: string[]) => string
  manifestPath: (resVer: number, db?: string) => string
  masterPath: (resVer: number, db?: string) => string
  downloadDir: (...relative: string[]) => string
  iconDir: (...relative: string[]) => string
  emblemDir: (...relative: string[]) => string
  cardDir: (...relative: string[]) => string
  scoreDir: (...relative: string[]) => string
  voiceDir: (...relative: string[]) => string
  bgmDir: (...relative: string[]) => string
  liveDir: (...relative: string[]) => string
  jacketDir: (...relative: string[]) => string
  batchDir: (...relative: string[]) => string
}

const appRoot: string = process.type === 'browser' ? join(__dirname, '..') : require('electron').ipcRenderer.sendSync('appRoot')

if (process.type === 'browser') {
  require('electron').ipcMain.on('appRoot', (event) => {
    event.returnValue = appRoot
  })
}

const getPath: GetPath = function getPath (...relative: string[]): string {
  return join(appRoot, ...relative)
}

getPath.configPath = getPath('../config.json')
getPath.logPath = getPath('../log.txt')
getPath.dataDir = (...relative) => getPath('../asset/data', ...relative)
getPath.manifestPath = (resVer, db = '') => getPath.dataDir(`manifest_${resVer}${db}`)
getPath.masterPath = (resVer, db = '') => getPath.dataDir(`master_${resVer}${db}`)
getPath.downloadDir = (...relative) => getPath('../asset/download', ...relative)
getPath.iconDir = (...relative) => getPath('../asset/icon', ...relative)
getPath.emblemDir = (...relative) => getPath('../asset/emblem', ...relative)
getPath.cardDir = (...relative) => getPath('../asset/card', ...relative)
getPath.scoreDir = (...relative) => getPath('../asset/score', ...relative)
getPath.voiceDir = (...relative) => getPath('../asset/voice', ...relative)
getPath.bgmDir = (...relative) => getPath('../asset/bgm', ...relative)
getPath.liveDir = (...relative) => getPath('../asset/live', ...relative)
getPath.jacketDir = (...relative) => getPath('../asset/jacket', ...relative)
getPath.batchDir = (...relative) => getPath('../asset/batch', ...relative)

export default getPath
