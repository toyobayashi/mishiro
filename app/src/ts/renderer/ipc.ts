import { RelaunchOptions, SaveDialogOptions, SaveDialogReturnValue } from 'electron'

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
