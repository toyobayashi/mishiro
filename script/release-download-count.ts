import request from '../src/ts/common/request'

const repeat = (s: string, n: number) => {
  if (n < 0) throw new Error('repeat(s, n < 0)')
  let str = ''
  for (let i = 0; i < n; i++) {
    str += s
  }
  return str
}
request({
  url: 'https://api.github.com/repos/toyobayashi/mishiro/releases',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36'
  }
}, (err, body) => {
  if (err) throw err
  console.log('Release' + repeat(' ', 40 - 7) + 'Download Count\n')
  let res = JSON.parse(body as string)
  let total = 0
  for (const release of res) {
    for (const asset of release.assets) {
      total += asset.download_count
      let line = asset.name + repeat(' ', 40 - asset.name.length) + asset.download_count
      console.log(line)
    }
  }
  console.log('\nTotal' + repeat(' ', 40 - 5) + total)
})
