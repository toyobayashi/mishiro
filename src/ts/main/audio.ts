import * as path from 'path'
import * as fs from 'fs-extra'
import * as Acb from 'acb'
const { Reader } = require('wav')
const { Encoder } = __non_webpack_require__('lame')
const { HCADecoder } = __non_webpack_require__('hca-decoder')

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
    const decoder: HCADecoder = new HCADecoder()
    decoder.decodeToWaveFile(hca, (err, wav) => {
      if (wav) resolve(wav)
      else reject(err)
    })
  })
}

function wav2mp3 (wav: string, mp3: string) {
  if (!mp3) mp3 = path.parse(wav).name + '.mp3'

  return new Promise((resolve, reject) => {
    let input = fs.createReadStream(wav)
    let output = fs.createWriteStream(mp3)

    output.on('close', () => {
      resolve(mp3)
    })

    let reader = new Reader()

    reader.on('format', (format: any) => {
      let encoder = new Encoder(format)
      reader.pipe(encoder).pipe(output)
    })

    reader.on('error', (err: Error) => {
      reject(err)
    })

    input.pipe(reader)
  })

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
    let hcas = await fs.readdir(hcadir)
    let task = []
    for (let i = 0; i < hcas.length; i++) {
      const hca = path.join(hcadir, hcas[i])
      // console.log(hca)
      // task.push(hca2mp3(hca, path.join(acbdir, path.parse(hca).name + '.mp3')))
      task.push(await hca2mp3(hca, path.join(acbdir, path.parse(hca).name + '.mp3')))
      if (singleComplete) singleComplete(task.length, hcas.length)
    }
    // let result = await Promise.all(task)
    await fs.remove(hcadir)
    return true
  } catch (err) {
    throw err
  }
}

export { acb2mp3, hca2mp3, acb2hca }
