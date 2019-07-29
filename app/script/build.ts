import { mainConfig, rendererConfig, preloadConfig, remoteRequireConfig } from './webpack.config'
import { compile } from './util'
import config from './config'

const options = Object.assign({}, config.statsOptions, { warnings: false })

export default function build () {
  return Promise.all([
    compile(mainConfig, options),
    compile(remoteRequireConfig, options),
    compile(preloadConfig, options),
    compile(rendererConfig, options)
  ])
}

if (require.main === module) {
  build().catch(err => console.log(err))
}
