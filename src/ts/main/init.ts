import { existsSync, mkdirsSync } from 'fs-extra'
import getPath from '../common/get-path'
import ipc from './ipc'

export default function () {
  const dirs = [
    './public/asset/sound/bgm',
    './public/asset/sound/live',
    './public/asset/sound/voice',
    './public/asset/score',
    './public/img/card',
    './public/img/icon',
    './download',
    './data'
  ]
  for (const dir of dirs) {
    if (!existsSync(getPath(dir))) mkdirsSync(getPath(dir))
  }
  ipc()
}
