import * as webpack from 'webpack'
import { main, renderer, mode } from './webpack.config'
import { createServer, Socket } from 'net'

if (mode === 'production') prod()
else dev()

export function dev () {
  let client: Socket | null = null

  startServer()
  webpackWatch()

  function webpackWatch () {
    const mainCompiler = webpack(main)
    const rendererCompiler = webpack(renderer)
    const watchOptions = {
      aggregateTimeout: 300,
      poll: undefined
    }

    mainCompiler.watch(watchOptions, watchHandler())
    rendererCompiler.watch(watchOptions, watchHandler(() => {
      if (client) client.write('reload')
    }))

    function watchHandler (cb?: Function) {
      return (err: Error, stats: webpack.Stats) => {
        if (err) {
          console.log(err)
          return
        }
        if (cb) cb()
        console.log(stats.toString({
          colors: true,
          children: false,
          entrypoints: false,
          modules: false
        }) + '\n')
      }
    }
  }

  function startServer () {
    return createServer((sock) => {
      sock.on('data', data => {
        if (data.toString() === 'mishiro' && !client) {
          client = sock
        }
      })

      sock.on('close', () => (console.log('close'), client = null))
      sock.on('error', (err) => console.log(err))
    }).listen(3461, 'localhost', () => console.log('Socket server listening on ' + 3461))
  }
}

export function prod (callback?: Function): Promise<void> {
  const webpackPromise = (option: webpack.Configuration) => new Promise<void>((resolve, reject) => {
    webpack(option, (err, stats) => {
      if (err) {
        console.log(err)
        return reject(err)
      }
      console.log(stats.toString({
        colors: true,
        children: false,
        entrypoints: false,
        modules: false
      }) + '\n')
      resolve()
    })
  })

  return Promise.all([
    webpackPromise(main),
    webpackPromise(renderer)
  ]).then(() => {
    if (callback) callback()
  })
}

/* export function checkAndBundleDll (callback?: Function) {
  const dllContent = getDllBundle()
  if (dllContent) {
    if (mode === 'production') {
      if (dllContent[dllContent.indexOf('=') - 1] === ' ') bundleDll(callback)
      else if (callback) callback()
    } else {
      if (dllContent[dllContent.indexOf('=') - 1] !== ' ') bundleDll(callback)
      else if (callback) callback()
    }
  } else bundleDll(callback)

  function bundleDll (callback?: Function) {
    webpack(dll, (err, stats) => {
      if (err) {
        console.log(err)
        return
      }
      console.log(stats.toString({
        colors: true,
        children: false,
        entrypoints: false,
        modules: false
      }) + '\n')
      if (callback) callback()
    })
  }

  function getDllBundle (): string | null {
    if (!fs.existsSync(manifest)) return null
    if (!dll.output) throw new Error('Empty output.')
    if (!dll.output.path || !dll.output.filename) throw new Error('Empty output.path or output.filename.')
    const dllFile = path.join(dll.output.path, dll.output.filename)
    if (!fs.existsSync(dllFile)) return null
    return fs.readFileSync(dllFile, 'utf8')
  }
} */
