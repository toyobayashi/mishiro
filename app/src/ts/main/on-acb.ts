import * as path from 'path'
import * as fs from 'fs-extra'
import { Event } from 'electron'
import { liveDir } from '../common/get-path'
import { audio } from 'mishiro-core'

export default async function (event: Event, acbPath: string | string[], arg?: any) {
  let isArr = Array.isArray(acbPath)
  try {
    if (isArr) {
      for (let i = 0; i < acbPath.length; i++) {
        let mp3list = await audio.acb2mp3(acbPath[i])
        await Promise.all(mp3list.map(mp3 => fs.move(mp3, path.join(path.dirname(acbPath[i]), path.basename(mp3)))))
        await Promise.all([
          fs.remove(mp3list.dirname),
          fs.remove(acbPath[i])
        ])
      }
    } else {
      let mp3list = await audio.acb2mp3(acbPath as string)
      let mp3 = mp3list[0]
      await fs.move(mp3, path.join(path.dirname(acbPath as string), path.basename(mp3)))
      await Promise.all([
        fs.remove(mp3list.dirname),
        fs.remove(acbPath as string)
      ])
    }
  } catch (err) {
    throw err
  }
  if (arg && !isArr) {
    const name = path.parse(acbPath as string).name
    let argArr = arg.split('/')
    if (argArr[argArr.length - 2] === 'live') {
      let fileName = argArr[argArr.length - 1]
      fs.renameSync(liveDir(`${name}.mp3`), liveDir(fileName))
      event.sender.send('acb', arg)
    } else {
      event.sender.send('acb', arg)
    }
  }
}
