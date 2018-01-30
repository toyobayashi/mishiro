import path from 'path'
export const getPath = (relative = '.') => path.join(__dirname, relative)
export default (relative = '.') => path.join(__dirname, '..', relative)
