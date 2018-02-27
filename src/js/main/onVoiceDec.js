import path from 'path'
import { remove } from '../util/fsExtra.js'
import { acb2hca, hca2mp3, readdirAsync } from './audio.js'

export default async function (event, acbs) {
  let hcaFiles = []
  let hcaDirs = []
  for (let i = 0; i < acbs.length; i++) {
    let acb = acbs[i]
    let hcadir = await acb2hca(acb)
    hcaDirs.push(hcadir)
    let files = await readdirAsync(hcadir)
    for (let j = 0; j < files.length; j++) {
      files[j] = path.join(hcadir, files[j])
    }
    hcaFiles = hcaFiles.concat(files)
  }
  for (let i = 0; i < hcaFiles.length; i++) {
    await hca2mp3(hcaFiles[i], path.join(path.parse(hcaFiles[i]).dir, '..', path.parse(hcaFiles[i]).name + '.mp3'))
    event.sender.send('singleHca', i + 1, hcaFiles.length)
  }
  for (let i = 0; i < acbs.length; i++) {
    remove(acbs[i])
    remove(hcaDirs[i])
  }
  event.sender.send('voiceEnd')
}
