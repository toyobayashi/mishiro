import * as path from 'path'
import { Event } from 'electron'
import * as fs from 'fs-extra'
import { audio } from 'mishiro-core'

export default async function (event: Event, acbs: string[]) {
  let hcaFiles: string[] = []
  let hcaDirs: string[] = []
  for (let i = 0; i < acbs.length; i++) {
    let acb = acbs[i]
    let files = await audio.acb2hca(acb)
    hcaDirs.push(files.dirname)
    hcaFiles = [...hcaFiles, ...files]
  }
  for (let i = 0; i < hcaFiles.length; i++) {
    await audio.hca2mp3(hcaFiles[i], path.join(path.dirname(hcaFiles[i]), '..', path.parse(hcaFiles[i]).name + '.mp3'))
    event.sender.send('singleHca', i + 1, hcaFiles.length)
  }
  Promise.all([Promise.all(acbs.map(acb => fs.remove(acb))), Promise.all(hcaDirs.map(hcaDir => fs.remove(hcaDir)))]).then(() => {
    event.sender.send('voiceEnd')
  })
}
