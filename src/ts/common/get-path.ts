import { join } from 'path'
export default (...relative: string[]) => join(__dirname, '..', ...relative)
