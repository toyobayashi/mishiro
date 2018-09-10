import { remote } from 'electron'

export default remote.getGlobal('getPath') as typeof getPath
