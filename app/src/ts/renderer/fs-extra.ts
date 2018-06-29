import { remote } from 'electron'

const fs: typeof fsExtra = remote.getGlobal('fsExtra')

// declare namespace global {
//   export let fs: typeof fsExtra
// }

// global.fs = fsExtra

export default fs
