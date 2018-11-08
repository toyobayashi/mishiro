import * as webpack from 'webpack'
import { main, renderer, mode } from './webpack.config'
import { Configuration } from 'webpack-dev-server'
import * as path from 'path'
import { removeSync } from 'fs-extra'
// import { createServer, Socket } from 'net'

const toStringOptions: webpack.Stats.ToStringOptionsObject = {
  colors: true,
  children: false,
  modules: false,
  entrypoints: false
}

if (require.main === module) {
  if (mode === 'production') prod()
  else dev()
}

export function dev () {
  // let client: Socket | null = null

  // startServer()
  // webpackWatch()

  // function webpackWatch () {
  //   const mainCompiler = webpack(main)
  //   const rendererCompiler = webpack(renderer)
  //   const watchOptions = {
  //     aggregateTimeout: 300,
  //     poll: undefined
  //   }

  //   mainCompiler.watch(watchOptions, watchHandler())
  //   rendererCompiler.watch(watchOptions, watchHandler(() => {
  //     if (client) client.write('reload')
  //   }))

  //   function watchHandler (cb?: Function) {
  //     return (err: Error, stats: webpack.Stats) => {
  //       if (err) {
  //         console.log(err)
  //         return
  //       }
  //       if (cb) cb()
  //       console.log(stats.toString({
  //         colors: true,
  //         children: false,
  //         entrypoints: false,
  //         modules: false
  //       }) + '\n')
  //     }
  //   }
  // }

  // function startServer () {
  //   return createServer((sock) => {
  //     sock.on('data', data => {
  //       if (data.toString() === 'mishiro' && !client) {
  //         client = sock
  //       }
  //     })

  //     sock.on('close', () => (console.log('close'), client = null))
  //     sock.on('error', (err) => console.log(err))
  //   }).listen(3461, 'localhost', () => console.log('Socket server listening on ' + 3461))
  // }
  if (renderer.output && renderer.output.path) removeSync(renderer.output.path)
  const { devServerHost, devServerPort, publicPath } = require('./config.json')

  const mainCompiler = webpack(main)
  mainCompiler.watch({
    aggregateTimeout: 200,
    poll: undefined
  }, (err, stats) => console.log(err || (stats.toString(toStringOptions) + '\n')))

  Promise.all([
    import('webpack-dev-server'),
    import('express-serve-asar')
  ]).then(([devServer, serveAsar]) => {
    const contentBase = path.join(__dirname, '../..')

    const options: Configuration = {
      stats: toStringOptions,
      host: devServerHost,
      hotOnly: true,
      inline: true,
      contentBase,
      publicPath,
      before (app) {
        app.use(serveAsar(contentBase))
      }
    }
    devServer.addDevServerEntrypoints(renderer, options)

    const server = new devServer(webpack(renderer), options)
    server.listen(devServerPort, devServerHost, () => {
      console.log('webpack server start.')
    })
  })

  // import('webpack-dev-server').then(devServer => {
  //   const asar = require('asar')
  //   const contentBase = path.join(__dirname, '../..')

  //   const options: Configuration = {
  //     stats: toStringOptions,
  //     host: devServerHost,
  //     hotOnly: true,
  //     inline: true,
  //     contentBase,
  //     publicPath: publicPath,
  //     before (app) {
  //       app.use((req, res, next) => {
  //         if (req.path.includes('.asar/')) {
  //           const fullPath: string = path.join(contentBase, req.path)
  //           const archive = fullPath.substr(0, fullPath.indexOf('.asar' + path.sep) + 5)
  //           const asarFile = fullPath.substr(fullPath.indexOf('.asar' + path.sep) + 6)
  //           try {
  //             const buffer = asar.extractFile(archive, asarFile)
  //             res.set({
  //               'Content-Type': mime.getType(asarFile),
  //               'Content-Length': buffer.length
  //             })
  //             res.status(200)
  //             res.send(buffer)
  //           } catch (err) {
  //             console.log(err)
  //             res.status(404).send('404 Not Found.')
  //           }
  //         } else {
  //           next()
  //         }
  //       })
  //     }
  //   }
  //   devServer.addDevServerEntrypoints(renderer, options)

  //   const server = new devServer(webpack(renderer), options)
  //   server.listen(devServerPort, devServerHost, () => {
  //     console.log('webpack server start.')
  //   })
  // })
}

export function prod (callback?: Function): Promise<void> {
  const webpackPromise = (option: webpack.Configuration) => new Promise<void>((resolve, reject) => {
    webpack(option, (err, stats) => {
      if (err) {
        console.log(err)
        return reject(err)
      }
      console.log(stats.toString(toStringOptions) + '\n')
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
