import { Configurer } from '../main/config'
import * as core from 'mishiro-core'

declare global {
  export const configurer: Configurer
  export const mishiroCore: typeof core
  export const client: core.Client
  export const getPath: typeof import('../main/get-path').default
  // export const __non_webpack_require__: (module: string) => any
}
