import { checkResourceVersion } from './ipc'

async function check (): Promise<number> {
  const resVer = window.preload.configurer.get('resVer')
  if (resVer) {
    return resVer
  }
  const res = await checkResourceVersion()
  if (res !== 0) {
    return res
  }

  throw new Error('Version checking failed')
}

export default check
