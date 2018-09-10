import { join } from 'path'

declare namespace global {
  export function getPath (...relative: string[]): string

  export namespace getPath {
    export const configPath: string
    export function dataDir (...relative: string[]): string
    export function manifestPath (resVer: number, db?: string): string
    export function masterPath (resVer: number, db?: string): string
    export function downloadDir (...relative: string[]): string
    export function iconDir (...relative: string[]): string
    export function cardDir (...relative: string[]): string
    export function scoreDir (...relative: string[]): string
    export function voiceDir (...relative: string[]): string
    export function bgmDir (...relative: string[]): string
    export function liveDir (...relative: string[]): string
  }
}

function getPath (...relative: string[]) {
  return join(__dirname, '..', ...relative)
}

namespace getPath {
  export const configPath = getPath('../config.json')
  export const dataDir = (...relative: string[]) => getPath(`../asset/data`, ...relative)
  export const manifestPath = (resVer: number, db: string = '') => dataDir(`manifest_${resVer}${db}`)
  export const masterPath = (resVer: number, db: string = '') => dataDir(`master_${resVer}${db}`)
  export const downloadDir = (...relative: string[]) => getPath(`../asset/download`, ...relative)
  export const iconDir = (...relative: string[]) => getPath(`../asset/icon`, ...relative)
  export const cardDir = (...relative: string[]) => getPath(`../asset/card`, ...relative)
  export const scoreDir = (...relative: string[]) => getPath(`../asset/score`, ...relative)
  export const voiceDir = (...relative: string[]) => getPath(`../asset/voice`, ...relative)
  export const bgmDir = (...relative: string[]) => getPath(`../asset/bgm`, ...relative)
  export const liveDir = (...relative: string[]) => getPath(`../asset/live`, ...relative)
}

global.getPath = getPath

export default global.getPath
