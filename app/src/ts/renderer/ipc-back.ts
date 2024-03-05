import store, { Action } from './store'

const { ipcRenderer } = window.node.electron

// const backWindowId = ipcRenderer.sendSync('backWindowId')

let id = 0

function createChannelName (): string {
  id = ((id + 1) % 0xffffff)
  return `__main_callback_${id}__`
}

let backWindowPort: MessagePort

ipcRenderer.on('port', e => {
  backWindowPort = e.ports[0]

  backWindowPort.addEventListener('message', (ev) => {
    if (ev.data.type === 'setBatchStatus') {
      store.commit(Action.SET_BATCH_STATUS, ev.data.payload[0])
    }
  })
})

function invokeBackWindow<T> (name: string, args: any[] = []): Promise<T> {
  console.log('invokeBackWindow: ', name, args)
  return new Promise((resolve, reject) => {
    if (!backWindowPort) {
      reject(new Error('back window is not ready'))
      return
    }
    const callbackChannel = createChannelName()
    backWindowPort.addEventListener('message', (ev) => {
      console.log('recieve: ', ev.data)
      if (ev.data.id === callbackChannel) {
        if (ev.data.err) {
          reject(new Error(ev.data.err))
        } else {
          resolve(ev.data.data)
        }
      }
    }, { once: true })
    backWindowPort.postMessage({
      id: callbackChannel,
      type: name,
      payload: args
    })
  })
}

export function openManifestDatabase (path: string): Promise<void> {
  return invokeBackWindow('openManifestDatabase', [path])
}

export function getMasterHash (): Promise<string> {
  return invokeBackWindow('getMasterHash')
}

export function readMasterData (masterFile: string): Promise<import('./back/on-master-read').MasterData> {
  return invokeBackWindow('readMasterData', [masterFile])
}

export function getCardHash (id: string | number): Promise<string> {
  return invokeBackWindow('getCardHash', [id])
}

export function getIconHash (id: string | number): Promise<string> {
  return invokeBackWindow('getIconHash', [id])
}

export function getEmblemHash (id: string | number): Promise<string> {
  return invokeBackWindow('getEmblemHash', [id])
}

export function searchResources (query: string): Promise<ResourceData[]> {
  return invokeBackWindow('searchResources', [query])
}

export function startBatchDownload (): Promise<boolean> {
  return invokeBackWindow('startBatchDownload')
}

export function stopBatchDownload (): Promise<boolean> {
  return invokeBackWindow('stopBatchDownload')
}

export function getBatchErrorList (): Promise<IBatchError[]> {
  return invokeBackWindow('getBatchErrorList')
}

export function setDownloaderProxy (proxy: string): Promise<void> {
  return invokeBackWindow('setDownloaderProxy', [proxy])
}
