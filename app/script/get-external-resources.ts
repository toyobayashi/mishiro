import { join, dirname } from 'path'
import * as got from 'got'
import * as fs from 'fs-extra'
import { unzipSync } from '@tybys/cross-zip'

(function () {
  const target = join(__dirname, '../tmp/mishiro-ex.zip')
  const tmpDir = dirname(target)

  if (fs.existsSync(target)) {
    unzipSync(target, join(__dirname, '../..'))
    return
  }

  if (fs.existsSync(tmpDir)) {
    fs.removeSync(tmpDir)
  }
  const stream = got.stream('https://github.com/toyobayashi/mishiro/releases/download/v1.0.0/mishiro-ex.zip', {
    headers: {
      'User-Agent': 'mishiro'
    }
  })

  if (!process.env.MISHIRO_NO_PROGRESS) {
    stream.on('downloadProgress', (progress) => {
      process.stdout.write(`\x1b[666D\x1b[0KDownload mishiro-ex.zip: ${(Math.floor(progress.percent * 10000) / 100).toFixed(2)}%`)
    })
  }

  stream.on('error', (err) => {
    console.error(err)
    process.exit(1)
  })

  fs.mkdirsSync(tmpDir)
  stream.pipe(fs.createWriteStream(target + '.tmp'))
    .on('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .on('close', () => {
      console.log('\nbefore-deploy done.')
      fs.renameSync(target + '.tmp', target)
      unzipSync(target, join(__dirname, '../..'))
      fs.removeSync(tmpDir)
    })
})()
