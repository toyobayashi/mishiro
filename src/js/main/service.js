import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
/* import { read } from '../util/fsExtra.js'
import SQL from './sqlExec.js' */
import { acb2mp3 } from './audio.js'
import { getPath } from '../common/getPath.js'
import config from './resolveConfig.js'
import onReadManifest from './onReadManifest.js'
import onReadMaster from './onReadMaster.js'
import onQueryManifest from './onQueryManifest.js'

let manifestData = {}
let manifests = []

ipcMain.on('queryManifest', (event, queryString) => {
  onQueryManifest(event, queryString, manifests)
})

ipcMain.on('readManifest', async (event, manifestFile, resVer) => {
  let obj = await onReadManifest(event, manifestFile, resVer)
  manifests = obj.manifests
  manifestData = obj.manifestData
})

ipcMain.on('readMaster', (event, masterFile) => {
  onReadMaster(event, masterFile, manifestData, config)
})

ipcMain.on('acb', async (event, acbPath, url = '') => {
  let isArr = Array.isArray(acbPath)
  try {
    if (isArr) {
      for (let i = 0; i < acbPath.length; i++) {
        await acb2mp3(acbPath[i])
      }
    } else {
      await acb2mp3(acbPath)
    }
  } catch (err) {
    throw err
  }
  if (url) {
    const name = path.parse(acbPath).name
    let urlArr = url.split('/')
    if (urlArr[urlArr.length - 2] === 'live') {
      let fileName = urlArr[urlArr.length - 1]
      fs.renameSync(getPath(`./public/asset/sound/live/${name}.mp3`), getPath(`./public/asset/sound/live/${fileName}`))
      event.sender.send('acb', url)
    } else {
      event.sender.send('acb', url)
    }
  } else {
    let pathArr = isArr ? acbPath[0].split('\\') : acbPath.split('\\')
    if (pathArr[pathArr.length - 3] === 'voice') {
      event.sender.send('voice')
    }
  }
  if (isArr) {
    for (let i = 0; i < acbPath.length; i++) {
      fs.unlinkSync(acbPath[i])
    }
  } else {
    fs.unlinkSync(acbPath)
  }
  /* exec(`${getPath()}\\bin\\CGSSAudio.exe ${acbPath}`, (err) => {
    if (!err) {
      if (url) {
        let urlArr = url.split('/')
        if (urlArr[urlArr.length - 2] === 'live') {
          let fileName = urlArr[urlArr.length - 1]
          urlArr[urlArr.length - 1] = fileName
          fs.renameSync(getPath(`./public/asset/sound/live/${name}.mp3`), getPath(`./public/asset/sound/live/${fileName}`))
          event.sender.send('acb', acbPath, url)
        } else {
          event.sender.send('acb', acbPath, url)
        }
      } else {
        fs.unlinkSync(acbPath)
      }
    }
  }) */
})

export default void 0
