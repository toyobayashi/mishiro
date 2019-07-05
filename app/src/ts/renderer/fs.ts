import { remote } from 'electron'

const fs: typeof import('fs-extra') = remote.getGlobal('fs')

export default fs
