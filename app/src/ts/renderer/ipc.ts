import { RelaunchOptions, SaveDialogOptions, SaveDialogReturnValue } from 'electron'
import { ServerResponse } from 'mishiro-core'

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

export function getProfile (viewer: string): Promise<ServerResponse> {
  return ipcRenderer.invoke('getProfile', viewer)
}
