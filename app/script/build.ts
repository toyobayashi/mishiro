import { mainConfig, rendererConfig, preloadConfig, remoteRequireConfig } from './webpack.config'
import { compile } from './util'
import config from './config'

export default function build () {
  return Promise.all([
    compile(mainConfig, config.statsOptions),
    compile(remoteRequireConfig, config.statsOptions),
    compile(preloadConfig, config.statsOptions),
    compile(rendererConfig, config.statsOptions)
  ])
}

if (require.main === module) {
  build().catch(err => console.log(err))
}
