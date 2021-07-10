import type { OpenDialogOptions, OpenDialogReturnValue, RelaunchOptions, SaveDialogOptions, SaveDialogReturnValue } from 'electron'
import type { ServerResponse } from 'mishiro-core'

const { ipcRenderer } = window.node.electron

export function relaunch (options: RelaunchOptions): void {
  return ipcRenderer.sendSync('relaunch', options)
}

export function exit (exitCode?: number): void {
  return ipcRenderer.sendSync('exit', exitCode)
}

export function showSaveDialog (options: SaveDialogOptions): Promise<SaveDialogReturnValue> {
  return ipcRenderer.invoke('showSaveDialog', options)
}

export function showOpenDialog (options: OpenDialogOptions): Promise<OpenDialogReturnValue> {
  return ipcRenderer.invoke('showOpenDialog', options)
}

export function getAppName (): string {
  return ipcRenderer.sendSync('appName')
}

export function getAppVersion (): string {
  return ipcRenderer.sendSync('appVersion')
}

export function getPackageJson (): Record<string, any> {
  return ipcRenderer.sendSync('package.json')
}

export function checkResourceVersion (): Promise<number> {
  return ipcRenderer.invoke('checkResourceVersion')
}

export function updateClientProxy (proxy: string): void {
  return ipcRenderer.sendSync('updateClientProxy', proxy)
}

export function getProfile (viewer: string): Promise<ServerResponse> {
  return ipcRenderer.invoke('getProfile', viewer)
}

export function getLyrics (scoreFile: string): Promise<Array<import('../main/on-lyrics').Lyric>> {
  return ipcRenderer.invoke('getLyrics', scoreFile)
}

export function getScoreDifficulties (scoreFile: string): Promise<any> {
  return ipcRenderer.invoke('getScoreDifficulties', scoreFile)
}

export function getScore (scoreFile: string, difficulty: number | string, bpm: number, src: string): Promise<any> {
  return ipcRenderer.invoke('getScore', scoreFile, difficulty, bpm, src)
}
