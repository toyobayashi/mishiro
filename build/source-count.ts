import * as fs from 'fs'
import * as path from 'path'

function countFile (filePath: string): number {
  const data = fs.readFileSync(filePath, 'utf8')
  let match: null | RegExpMatchArray = data.match(/\r?\n/g)
  if (match) return match.length + 1
  return 1
}

interface CountInfo {
  format: string
  fileCount: number
  lineCount: number
}

function count (folderPath: string, resolve: string[]): CountInfo[] {
  let result: CountInfo[] = []
  for (const ext of resolve) {
    result.push({ format: ext, fileCount: 0, lineCount: 0 })
  }
  function countFolder (folderPath: string, resolve: string[]) {
    let list = fs.readdirSync(folderPath)
    for (const name of list) {
      const absPath = path.join(folderPath, name)
      if (fs.statSync(absPath).isFile()) {
        const extIndex = resolve.indexOf(path.parse(absPath).ext)
        if (extIndex !== -1) {
          result[extIndex].lineCount += countFile(absPath)
          result[extIndex].fileCount += 1
        }
      } else {
        countFolder(absPath, resolve)
      }
    }
  }
  countFolder(folderPath, resolve)
  return result
}

const getPath = (r: string) => path.join(__dirname, '..', r)

console.log(count(getPath('./src'), ['.ts', '.js', '.vue']))
