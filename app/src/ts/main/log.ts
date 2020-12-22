import * as spdlog from 'spdlog'
import getPath from '../common/get-path'

let logger: spdlog.RotatingLogger | null = null

function init (): void {
  if (!logger) {
    logger = spdlog.createRotatingLogger('mishiro', getPath.logPath, 1024 * 1024 * 5, 3)
    logger.setLevel(2)
  }
}

export function info (msg: string): void {
  init()
  logger!.info(msg)
}

export function warn (msg: string): void {
  init()
  logger!.warn(msg)
}

export function error (msg: string): void {
  init()
  logger!.error(msg)
}

export function critical (msg: string): void {
  init()
  logger!.critical(msg)
}
