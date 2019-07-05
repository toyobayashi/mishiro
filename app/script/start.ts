import { spawn } from 'child_process'
import { getPath } from './util'
import config from './config'
const electronPath = require('electron')

export default function start () {
  if (config.mode === 'production') {
    const cp = spawn(electronPath, [
      getPath()
    ], {
      cwd: getPath(),
      stdio: 'inherit'
    })
    return cp
  } else {
    const cp = spawn(electronPath, [
      '--remote-debugging-port=9222',
      '--inspect=' + Date.now() % 65536,
      getPath()
    ], {
      cwd: getPath(),
      stdio: 'inherit'
    })
    return cp
  }
}

if (require.main === module) {
  start()
}
