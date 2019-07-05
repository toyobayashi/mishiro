import { join } from 'path'
import * as webpack from 'webpack'
import * as WebpackDevServer from 'webpack-dev-server'

export function getPath (...relative: string[]): string {
  return join(__dirname, '..', ...relative)
}

export function compile (config: webpack.Configuration, statsOptions?: boolean | 'errors-only' | 'errors-warnings' | 'minimal' | 'none' | 'normal' | 'verbose' | webpack.Stats.ToStringOptionsObject) {
  return new Promise<void>((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
        console.log(err)
        return reject(err)
      }
      console.log(stats.toString(statsOptions) + '\n')
      resolve()
    })
  })
}

export function watch (config: webpack.Configuration, handler: webpack.ICompiler.Handler) {
  const compiler = webpack(config)
  compiler.watch({
    aggregateTimeout: 200,
    poll: undefined
  }, handler)
  return compiler
}

export function startDevServer (configuration: webpack.Configuration, port: number, host: string, callback?: (error?: Error) => void) {
  const devServerOptions = configuration.devServer || {}
  WebpackDevServer.addDevServerEntrypoints(configuration, devServerOptions)
  const server = new WebpackDevServer(webpack(configuration), devServerOptions)

  return server.listen(port, host, callback)
}
