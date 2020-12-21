import { ipcRenderer, Event, IpcRendererEvent } from 'electron'
import * as ElectronGithubAsarUpdater from 'electron-github-asar-updater'

class Updater {
  private _onDownloadProgress: ((event: IpcRendererEvent, data: ElectronGithubAsarUpdater.ProgressData) => void) | null = null

  public relaunch (): void {
    return ipcRenderer.sendSync('updater#relaunch')
  }

  public getUpdateInfo (): ElectronGithubAsarUpdater.Info {
    return ipcRenderer.sendSync('updater#getUpdateInfo')
  }

  public abort (): void {
    return ipcRenderer.sendSync('updater#abort')
  }

  public async check (options?: ElectronGithubAsarUpdater.CheckOptions): Promise<ElectronGithubAsarUpdater.Info | null> {
    return ipcRenderer.invoke('updater#check', options)
  }

  public async download (): Promise<boolean> {
    return ipcRenderer.invoke('updater#download')
  }

  public onDownload (onDownloadProgress: ElectronGithubAsarUpdater.OnProgressCallback | null): void {
    const channel = 'updater#onDownloadProgress'
    if (this._onDownloadProgress) {
      ipcRenderer.off(channel, this._onDownloadProgress)
      this._onDownloadProgress = null
    }
    if (onDownloadProgress) {
      this._onDownloadProgress = function (_event: Event, data: ElectronGithubAsarUpdater.ProgressData) {
        onDownloadProgress(data)
      }
      ipcRenderer.on(channel, this._onDownloadProgress)
    }
  }
}

const updater = new Updater()

export default updater
