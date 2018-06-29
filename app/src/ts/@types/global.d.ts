import { Configurer } from '../main/config'
import * as core from 'mishiro-core'
import * as fs from 'fs-extra'

declare global {
  export const configurer: Configurer
  export const mishiroCore: typeof core
  export const client: core.Client
  export const fsExtra: typeof fs
  // export const __non_webpack_require__: (module: string) => any
}
