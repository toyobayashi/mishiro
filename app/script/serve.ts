import { mainConfig, rendererConfig, preloadConfig } from './webpack.config'
import { watch, startDevServer } from './util'
import config from './config'

export default function serve () {

  watch(mainConfig, function watchHandler (err, stats) {
    if (err) {
      console.log(err)
      return
    }

    console.log(stats.toString(config.statsOptions) + '\n')
  })

  watch(preloadConfig, function watchHandler (err, stats) {
    if (err) {
      console.log(err)
      return
    }

    console.log(stats.toString(config.statsOptions) + '\n')
  })

  startDevServer(rendererConfig, config.devServerPort, config.devServerHost, function (err) {
    if (err) {
      console.log(err)
      return
    }
  })
}

if (require.main === module) {
  serve()
}
