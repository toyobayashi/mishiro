import * as spdlog from '@vscode/spdlog'
import * as fs from 'fs-extra'
import { dirname } from 'path'
import getPath from '../common/get-path'

let logger: spdlog.Logger

function init (): void {
  if (!logger) {
    fs.mkdirsSync(dirname(getPath.logPath))
    logger = new spdlog.Logger('rotating', 'mishiro', getPath.logPath, 1024 * 1024 * 5, 3)
    logger.setLevel(2)
  }
}

export function info (msg: string): void {
  init()
  logger.info(msg)
}

export function warn (msg: string): void {
  init()
  logger.warn(msg)
}

export function error (msg: string): void {
  init()
  logger.error(msg)
}

export function critical (msg: string): void {
  init()
  logger.critical(msg)
}
