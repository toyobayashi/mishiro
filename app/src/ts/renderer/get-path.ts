import { remote } from 'electron'
import { getPath } from './typings/main'

export default remote.getGlobal('getPath') as typeof getPath
