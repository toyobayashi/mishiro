const { ipcRenderer } = window.node.electron

const backWindowId = ipcRenderer.sendSync('backWindowId')

let id = 0

function createChannelName (): string {
  id = ((id + 1) % 0xffffff)
  return `__main_callback_${id}__`
}

export function openManifestDatabase (path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const callbackChannel = createChannelName()
    ipcRenderer.once(callbackChannel, (_event, errmsg) => {
      if (errmsg) reject(new Error(errmsg))
      else resolve()
    })
    ipcRenderer.sendTo(backWindowId, 'openManifestDatabase', callbackChannel, path)
  })
}

export function getMasterHash (): Promise<string> {
  return new Promise((resolve, reject) => {
    const callbackChannel = createChannelName()
    ipcRenderer.once(callbackChannel, (_event, errmsg, hash) => {
      if (errmsg) reject(new Error(errmsg))
      else resolve(hash)
    })
    ipcRenderer.sendTo(backWindowId, 'getMasterHash', callbackChannel)
  })
}

export function readMasterData (masterFile: string): Promise<import('./back/on-master-read').MasterData> {
  return new Promise((resolve, reject) => {
    const callbackChannel = createChannelName()
    ipcRenderer.once(callbackChannel, (_event, errmsg, data) => {
      if (errmsg) reject(new Error(errmsg))
      else resolve(data)
    })
    ipcRenderer.sendTo(backWindowId, 'readMasterData', callbackChannel, masterFile)
  })
}

export function getCardHash (id: string | number): Promise<string> {
  return new Promise((resolve, reject) => {
    const callbackChannel = createChannelName()
    ipcRenderer.once(callbackChannel, (_event, errmsg, hash) => {
      if (errmsg) reject(new Error(errmsg))
      else resolve(hash)
    })
    ipcRenderer.sendTo(backWindowId, 'getCardHash', callbackChannel, id)
  })
}

export function getIconHash (id: string | number): Promise<string> {
  return new Promise((resolve, reject) => {
    const callbackChannel = createChannelName()
    ipcRenderer.once(callbackChannel, (_event, errmsg, hash) => {
      if (errmsg) reject(new Error(errmsg))
      else resolve(hash)
    })
    ipcRenderer.sendTo(backWindowId, 'getIconHash', callbackChannel, id)
  })
}

export function getEmblemHash (id: string | number): Promise<string> {
  return new Promise((resolve, reject) => {
    const callbackChannel = createChannelName()
    ipcRenderer.once(callbackChannel, (_event, errmsg, hash) => {
      if (errmsg) reject(new Error(errmsg))
      else resolve(hash)
    })
    ipcRenderer.sendTo(backWindowId, 'getEmblemHash', callbackChannel, id)
  })
}

export function searchResources (query: string): Promise<ResourceData[]> {
  return new Promise((resolve, reject) => {
    const callbackChannel = createChannelName()
    ipcRenderer.once(callbackChannel, (_event, errmsg, data) => {
      if (errmsg) reject(new Error(errmsg))
      else resolve(data)
    })
    ipcRenderer.sendTo(backWindowId, 'searchResources', callbackChannel, query)
  })
}

export function startBatchDownload (): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const callbackChannel = createChannelName()
    ipcRenderer.once(callbackChannel, (_event, errmsg, downloading) => {
      if (errmsg) reject(new Error(errmsg))
      else resolve(downloading)
    })
    ipcRenderer.sendTo(backWindowId, 'startBatchDownload', callbackChannel)
  })
}

export function stopBatchDownload (): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const callbackChannel = createChannelName()
    ipcRenderer.once(callbackChannel, (_event, errmsg, downloading) => {
      if (errmsg) reject(new Error(errmsg))
      else resolve(downloading)
    })
    ipcRenderer.sendTo(backWindowId, 'stopBatchDownload', callbackChannel)
  })
}

export function getBatchErrorList (): Promise<IBatchError[]> {
  return new Promise((resolve, reject) => {
    const callbackChannel = createChannelName()
    ipcRenderer.once(callbackChannel, (_event, errmsg, list) => {
      if (errmsg) reject(new Error(errmsg))
      else resolve(list)
    })
    ipcRenderer.sendTo(backWindowId, 'getBatchErrorList', callbackChannel)
  })
}
