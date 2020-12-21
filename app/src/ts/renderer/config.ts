import { ipcRenderer } from 'electron'

export class Configurer {
  public getAll (): import('../main/config').MishiroConfig {
    return ipcRenderer.sendSync('configurer#getAll')
  }

  public get<K extends import('../main/config').MishiroConfigKey> (key: K): import('../main/config').MishiroConfig[K] {
    return ipcRenderer.sendSync('configurer#get', key)
  }

  public set (obj: import('../main/config').MishiroConfig): void
  public set<K extends import('../main/config').MishiroConfigKey> (obj: K, value: import('../main/config').MishiroConfig[K]): void
  public set<K extends import('../main/config').MishiroConfigKey> (key: K | import('../main/config').MishiroConfig, value?: import('../main/config').MishiroConfig[K]): void {
    return ipcRenderer.sendSync('configurer#set', key, value)
  }

  public remove (key: import('../main/config').MishiroConfigKey): void {
    return ipcRenderer.sendSync('configurer#remove', key)
  }
}

const configurer = new Configurer()

export default configurer
