import webpack from 'webpack'
// import path from 'path'
// import fs from 'fs-extra'
import { main, renderer, mode } from './webpack.config'

const arg: string | undefined = process.argv.slice(2)[0]
if (arg === 'dll') {
  // checkAndBundleDll()
} else if (arg === 'webpack') {
  if (mode === 'production') prod()
  else dev()
}

export function dev () {

  webpackWatch()

  function webpackWatch () {
    const mainCompiler = webpack(main)
    const rendererCompiler = webpack(renderer)
    const watchOptions = {
      aggregateTimeout: 300,
      poll: undefined
    }

    mainCompiler.watch(watchOptions, watchHandler())
    rendererCompiler.watch(watchOptions, watchHandler())

    function watchHandler () {
      return (err: Error, stats: webpack.Stats) => {
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
      }
    }
  }
}

export function prod (callback?: Function): Promise<void> {
  return new Promise((resolve, reject) => {
    webpack([main, renderer], (err, stats: any) => {
      if (err) {
        console.log(err)
        reject(err)
        return
      }
      if (callback) {
        callback(stats)
      } else {
        console.log(stats.toString({
          modules: false,
          colors: true
        }) + '\n')
      }
      resolve()
    })
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
