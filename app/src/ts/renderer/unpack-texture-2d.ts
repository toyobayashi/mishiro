const fs = window.node.fs
// import getPath from './get-path'
// import { format } from 'url'

// let id = ipcRenderer.sendSync('mainWindowId')

// let win: BrowserWindow | null = new remote.BrowserWindow({ width: 346, height: 346, show: true/* process.env.NODE_ENV !== 'production' */, parent: remote.BrowserWindow.fromId(id) })

// if (process.env.NODE_ENV === 'production') {
//   win.loadURL(format({
//     pathname: getPath('./public/back.html'),
//     protocol: 'file:',
//     slashes: true
//   }))
// } else {
//   const { devServerHost, devServerPort, publicPath } = require('../../../script/config.json')
//   win.loadURL(`http://${devServerHost}:${devServerPort}${publicPath}back.html`)
// }

// window.addEventListener('beforeunload', () => {
//   if (win) win.close()
//   win = null
// })

export function unpackTexture2D (assetbundle: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // let randomId = (Math.round(Math.random() * 346346) + new Date().getTime()).toString()
    // ipcRenderer.once(randomId, (_event: Event, err: { message: string; stack?: string } | null, pngs: string[]) => {
    //   if (err) {
    //     const newErr = new Error()
    //     newErr.message = err.message
    //     newErr.stack = err.stack
    //     return reject(newErr)
    //   }
    //   resolve(pngs)
    // })
    // console.log(assetbundle);
    // (win as BrowserWindow).webContents.send('texture2d', assetbundle, randomId, id)
    window.node.mishiroCore.util.unpackTexture2D(assetbundle).then((result: string[]) => {
      fs.removeSync(assetbundle)
      resolve(result)
    }).catch((e: Error) => {
      reject({
        message: e.message,
        stack: e.stack
      })
    })
  })
}
