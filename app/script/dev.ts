import { mainConfig, rendererConfig/* , preloadConfig */ } from './webpack.config'
import { watch, startDevServer } from './util'
import config from './config'
import start from './start'
import { ChildProcess } from 'child_process'

export default function dev () {
  let appProcess: ChildProcess | null = null

  const onExit = function onExit (_code?: number, signal?: string) {
    appProcess = null
    if (signal === 'SIGKILL') {
      appProcess = start()
      appProcess.once('exit', onExit)
    }
  }

  const firstLaunch = {
    main: false,
    // preload: false,
    renderer: false
  }

  const isReady = () => firstLaunch.main /* && firstLaunch.preload */ && firstLaunch.renderer

  const relaunch = function relaunch () {
    if (appProcess) {
      appProcess.kill('SIGKILL')
    } else {
      appProcess = start()
      appProcess.once('exit', onExit)
    }
  }

  watch(mainConfig, function watchHandler (err, stats) {
    if (err) {
      console.log(err)
      return
    }

    if (!firstLaunch.main) firstLaunch.main = true

    if (isReady()) {
      relaunch()
    }

    console.log(stats.toString(config.statsOptions) + '\n')
  })

  /* watch(preloadConfig, function watchHandler (err, stats) {
    if (err) {
      console.log(err)
      return
    }

    if (!firstLaunch.preload) firstLaunch.preload = true

    if (isReady()) {
      relaunch()
    }

    console.log(stats.toString(config.statsOptions) + '\n')
  }) */

  startDevServer(rendererConfig, config.devServerPort, config.devServerHost, function (err) {
    if (err) {
      console.log(err)
      return
    }
    if (!firstLaunch.renderer) firstLaunch.renderer = true

    if (!appProcess && isReady()) {
      relaunch()
    }
  })
}

if (require.main === module) {
  dev()
}
