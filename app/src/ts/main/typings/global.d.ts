import { Configurer } from '../config'
import * as core from 'mishiro-core'

declare global {
  export const configurer: Configurer
  export const mishiroCore: typeof core
  export const client: core.Client
  export const getPath: typeof import('../get-path').default
  export const updater: import('electron-github-asar-updater')
  export const fs: typeof import('fs-extra')
  export const request: typeof import('request')
  // export const __non_webpack_require__: (module: string) => any
}
