import { Configurer } from '../config'
import { Client } from 'mishiro-core'

declare global {
  export const configurer: Configurer
  export const client: Client
  export const getPath: typeof import('../get-path').default
  export const updater: import('electron-github-asar-updater')
}
