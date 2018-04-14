import { join } from 'path'
export default (relative = '.') => join(__dirname, '..', relative)
