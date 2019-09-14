import { join } from 'path'

const { setCache } = __non_webpack_require__('./export.js')

function getPath (...relative: string[]): string {
  return join(__dirname, '..', ...relative)
}

// eslint-disable-next-line no-redeclare
namespace getPath {
  export const configPath = getPath('../config.json')
  export const dataDir = (...relative: string[]): string => getPath('../asset/data', ...relative)
  export const manifestPath = (resVer: number, db: string = ''): string => dataDir(`manifest_${resVer}${db}`)
  export const masterPath = (resVer: number, db: string = ''): string => dataDir(`master_${resVer}${db}`)
  export const downloadDir = (...relative: string[]): string => getPath('../asset/download', ...relative)
  export const iconDir = (...relative: string[]): string => getPath('../asset/icon', ...relative)
  export const emblemDir = (...relative: string[]): string => getPath('../asset/emblem', ...relative)
  export const cardDir = (...relative: string[]): string => getPath('../asset/card', ...relative)
  export const scoreDir = (...relative: string[]): string => getPath('../asset/score', ...relative)
  export const voiceDir = (...relative: string[]): string => getPath('../asset/voice', ...relative)
  export const bgmDir = (...relative: string[]): string => getPath('../asset/bgm', ...relative)
  export const liveDir = (...relative: string[]): string => getPath('../asset/live', ...relative)
}

setCache('getPath', getPath)

export default getPath
