import { ipcRenderer } from 'electron'

const mainWindowId = ipcRenderer.sendSync('mainWindowId')
export default mainWindowId
