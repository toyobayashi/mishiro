import { remote } from 'electron'

const request: typeof import('request') = remote.getGlobal('request')

export default request
