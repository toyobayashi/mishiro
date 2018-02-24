import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'
import { getPath } from '../common/getPath.js'
import { dec } from 'hca'
import { remove } from '../util/fsExtra'

const ACB = getPath('./bin/AcbUnzip.exe')
const FFMPEG = getPath('./bin/ffmpeg.exe')

function execAsync (cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(err)
      else resolve({ stdout, stderr })
    })
  })
}

function readdirAsync (dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) reject(err)
      else resolve(files)
    })
  })
}

async function acb2hca (acb) {
  try {
    await execAsync(`"${ACB}" "${acb}"`)
    return path.join(path.parse(acb).dir, `_acb_${path.parse(acb).base}`)
  } catch (err) {
    throw err
  }
}

function hca2wav (hca) {
  return new Promise((resolve, reject) => {
    dec(hca, result => {
      if (result) resolve(path.join(path.parse(hca).dir, path.parse(hca).name + '.wav'))
      else reject(new Error(`Failed to decode ${path.parse(hca).base}`))
    })
  })
}

async function wav2mp3 (wav, mp3) {
  if (!mp3) mp3 = path.parse(wav).name + '.mp3'
  try {
    await execAsync(`"${FFMPEG}" -i "${wav}" "${mp3}" -v quiet`)
    return mp3
  } catch (err) {
    throw err
  }
}

async function hca2mp3 (hca, mp3) {
  if (!mp3) mp3 = path.parse(hca).name + '.mp3'
  try {
    let wav = await hca2wav(hca)
    let mp3Path = await wav2mp3(wav, mp3)
    return mp3Path
  } catch (err) {
    throw err
  }
}

async function acb2mp3 (acb) {
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
    }
    // let result = await Promise.all(task)
    await remove(hcadir)
    return true
  } catch (err) {
    throw err
  }
}

export { acb2mp3, hca2mp3 }
