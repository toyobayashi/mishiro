import * as fs from 'fs-extra'
import * as path from 'path'

function countFile (filePath: string): number {
  const data = fs.readFileSync(filePath, 'utf8')
  const match: null | RegExpMatchArray = data.match(/\r?\n/g)
  if (match) return match.length + 1
  return 1
}

interface CountInfo {
  language?: string
  fileCount: number
  lineCount: number
}

function count (folderPath: string, resolve: string[], exclude?: RegExp): CountInfo[] {
  const result: CountInfo[] = []
  for (const ext of resolve) {
    result.push({ language: ext, fileCount: 0, lineCount: 0 })
  }
  function countFolder (folderPath: string, resolve: string[]): void {
    const list = fs.readdirSync(folderPath)
    for (const name of list) {
      const absPath = path.join(folderPath, name)
      if (!exclude || !exclude.test(absPath)) {
        if (fs.statSync(absPath).isFile()) {
          const extIndex = resolve.indexOf(path.parse(absPath).ext)
          if (extIndex !== -1) {
            result[extIndex].lineCount += countFile(absPath)
            result[extIndex].fileCount += 1
          }
        } else countFolder(absPath, resolve)
      }
    }
  }
  countFolder(folderPath, resolve)

  const total: CountInfo = { fileCount: 0, lineCount: 0 }
  for (const c of result) {
    total.fileCount += c.fileCount
    total.lineCount += c.lineCount
  }
  result.push(total)
  return result
}

const getPath = (r: string): string => path.join(__dirname, '..', r)

console.log(count(
  getPath('.'),
  ['.ts', '.css', '.vue', '.json', '.html'],
  /node_modules|\.vscode|\.git|data|dist|cache|download|public\\.*\..+s|release|package-lock\.json/
))
