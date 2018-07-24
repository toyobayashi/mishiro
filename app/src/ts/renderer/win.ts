import { remote, BrowserWindow } from 'electron'

let win: BrowserWindow | null = new remote.BrowserWindow({ width: 346, height: 346, show: false, parent: remote.BrowserWindow.getFocusedWindow() })

win.loadURL(`data:text/html,
<html><script type="text/javascript">
const ipcRenderer = require('electron').ipcRenderer;
const BrowserWindow = require('electron').remote.BrowserWindow;
const { util } = require('mishiro-core');
const { removeSync } = require('fs-extra');

ipcRenderer.on('texture2d', (event, assetbundle, data, fromWindowId) => {
  const fromWindow = BrowserWindow.fromId(fromWindowId);
  util.unpackTexture2D(assetbundle).then(result => {
    removeSync(assetbundle);
    fromWindow.webContents.send('texture2d', null, result, data);
  }).catch(e => {
    fromWindow.webContents.send('texture2d', e, null, data);
  });
});

</script></html>
`)

window.addEventListener('beforeunload', () => {
  if (win) win.close()
  win = null
})

export default win
