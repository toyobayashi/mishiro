import { get } from 'https'

const repeat = (s: string, n: number) => {
  if (n < 0) throw new Error('repeat(s, n < 0)')
  let str = ''
  for (let i = 0; i < n; i++) {
    str += s
  }
  return str
}

get({
  host: 'api.github.com',
  path: '/repos/toyobayashi/mishiro/releases',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
  }
}, (response) => {
  let body = ''
  response.on('data',chunk => body += chunk)
  response.on('end', () => {
    console.log('Release' + repeat(' ', 40 - 7) + 'Download Count\n')

    let res = JSON.parse(body)
    let total = 0
    try {
      for (const release of res) {
        for (const asset of release.assets) {
          total += asset.download_count
          let line = asset.name + repeat(' ', 40 - asset.name.length) + asset.download_count
          console.log(line)
        }
      }
      console.log('\nTotal' + repeat(' ', 40 - 5) + total)
    } catch (err) {
      console.log(res)
    }
  })
  response.on('error', err => console.log(err))
})
