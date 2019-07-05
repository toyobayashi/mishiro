import * as webpack from 'webpack'

type WebpackToString = boolean | 'errors-only' | 'errors-warnings' | 'minimal' | 'none' | 'normal' | 'verbose' | webpack.Stats.ToStringOptionsObject

interface InnoConfig {
  appid: {
    ia32: string
    x64: string
  }
  url: string
}

interface Config {
  mode: 'production' | 'development'
  devServerHost: string
  devServerPort: number
  outputPath: string
  contentBase: string
  publicPath: string
  distPath: string
  iconSrcDir: string
  iconOutDir: string
  inno: InnoConfig
  statsOptions: WebpackToString
}

const config: Config = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devServerHost: 'localhost',
  devServerPort: 3461,
  outputPath: 'public',
  contentBase: '..',
  publicPath: '/app/public/',
  distPath: '../dist',
  iconSrcDir: './src/res/icon',
  iconOutDir: 'img',
  inno: {
    appid: {
      ia32: '1988B0A7-591C-4EE6-B069-96723508F0D5',
      x64: '76632B3A-54F9-4986-A8DE-445BFECE5116'
    },
    url: 'https://github.com/toyobayashi/mishiro'
  },

  statsOptions: {
    colors: true,
    children: false,
    modules: false,
    entrypoints: false
  }
}

export default config
