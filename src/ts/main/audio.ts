import { exec } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import getPath from '../common/get-path'
import { remove } from '../common/fse'
import * as Acb from 'acb'
// import { dec } from '../../@types/hca/'
// import { dec } from '../../cpp/hca/build/Release/hca.node'
const dec: hca.dec = __non_webpack_require__('./addon/hca.node').dec

const FFMPEG = getPath('./public/bin/ffmpeg.exe')

function execAsync (cmd: string) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(err)
      else resolve({ stdout, stderr })
    })
  })
}

function readdirAsync (dir: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) reject(err)
      else resolve(files)
    })
  })
}

async function acb2hca (acb: string) {
  try {
    await Acb.extract(acb)
    return path.join(path.dirname(acb), `_acb_${path.basename(acb)}`)
  } catch (err) {
    throw err
  }
}

function hca2wav (hca: string): Promise<string> {
  return new Promise((resolve, reject) => {
    dec(hca, (wav: string) => {
      if (wav) resolve(wav)
      else reject(new Error(`Failed to decode ${path.parse(hca).base}`))
    })
  })
}

async function wav2mp3 (wav: string, mp3: string) {
  if (!mp3) mp3 = path.parse(wav).name + '.mp3'
  try {
    await execAsync(`"${FFMPEG}" -i "${wav}" "${mp3}" -v quiet`)
    return mp3
  } catch (err) {
    throw err
  }
}

async function hca2mp3 (hca: string, mp3: string) {
  if (!mp3) mp3 = path.parse(hca).name + '.mp3'
  try {
    let wav = await hca2wav(hca)
    let mp3Path = await wav2mp3(wav, mp3)
    return mp3Path
  } catch (err) {
    throw err
  }
}

async function acb2mp3 (acb: string, singleComplete?: Function) {
  const acbdir = path.parse(acb).dir
  try {
    let hcadir = await acb2hca(acb)
    let hcas = await readdirAsync(hcadir)
    let task = []
    for (let i = 0; i < hcas.length; i++) {
      const hca = path.join(hcadir, hcas[i])
      // console.log(hca)
      // task.push(hca2mp3(hca, path.join(acbdir, path.parse(hca).name + '.mp3')))
      task.push(await hca2mp3(hca, path.join(acbdir, path.parse(hca).name + '.mp3')))
      if (singleComplete) singleComplete(task.length, hcas.length)
    }
    // let result = await Promise.all(task)
    await remove(hcadir)
    return true
  } catch (err) {
    throw err
  }
}

export { acb2mp3, hca2mp3, acb2hca, readdirAsync }
