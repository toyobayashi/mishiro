import path from 'path'
import fs from 'fs'
import getPath from '../common/getPath.js'
import { acb2mp3 } from './audio.js'

export default async function (event, acbPath, arg) {
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
  if (arg) {
    const name = path.parse(acbPath).name
    let argArr = arg.split('/')
    if (argArr[argArr.length - 2] === 'live') {
      let fileName = argArr[argArr.length - 1]
      fs.renameSync(getPath(`./public/asset/sound/live/${name}.mp3`), getPath(`./public/asset/sound/live/${fileName}`))
      event.sender.send('acb', arg)
    } else {
      event.sender.send('acb', arg)
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
      if (arg) {
        let argArr = arg.split('/')
        if (argArr[argArr.length - 2] === 'live') {
          let fileName = argArr[argArr.length - 1]
          argArr[argArr.length - 1] = fileName
          fs.renameSync(getPath(`./public/asset/sound/live/${name}.mp3`), getPath(`./public/asset/sound/live/${fileName}`))
          event.sender.send('acb', acbPath, arg)
        } else {
          event.sender.send('acb', acbPath, arg)
        }
      } else {
        fs.unlinkSync(acbPath)
      }
    }
  }) */
}
