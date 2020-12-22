import { ipcRenderer } from 'electron'

export function info (msg: string): void {
  ipcRenderer.sendSync('log', 'info', msg)
}

export function warn (msg: string): void {
  ipcRenderer.sendSync('log', 'warn', msg)
}

export function error (msg: string): void {
  ipcRenderer.sendSync('log', 'error', msg)
}

export function critical (msg: string): void {
  ipcRenderer.sendSync('log', 'critical', msg)
}
