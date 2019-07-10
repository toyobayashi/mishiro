import { arch as PackagerArch, Options } from 'electron-packager'
import { getPath } from './util'
import { execSync } from 'child_process'
import * as pkg from '../package.json'
import { existsSync } from 'fs'
import config from './config'
import chalk from 'chalk'

export const arch: PackagerArch = process.argv.slice(2)[0] as PackagerArch || 'x64'

// tslint:disable-next-line: strict-type-predicates
const author = typeof pkg.author === 'object' ? (pkg.author as any).name as string : pkg.author

interface ProductionPackage {
  name: string
  version: string
  main: string
  author: string
  repository: {
    type: string
    url: string
  }
  license: string
  dependencies?: { [module: string]: string }
  _commit?: string
  _commitDate?: string
}

export const productionPackage: ProductionPackage = {
  name: pkg.name,
  version: pkg.version,
  main: pkg.main,
  author,
  repository: pkg.repository,
  license: pkg.license
}

if ((pkg as any).dependencies) {
  productionPackage.dependencies = (pkg as any).dependencies
}

try {
  productionPackage._commit = execSync('git rev-parse HEAD').toString().replace(/[\r\n]/g, '')
  productionPackage._commitDate = new Date((execSync('git log -1').toString().match(/Date:\s*(.*?)\n/) as any)[1]).toISOString()
} catch (err) {
  console.log(chalk.yellowBright('\n  [WARN] Not a git repository.\n'))
}

const packagerOptions: Options = {
  dir: getPath(),
  out: getPath(config.distPath),
  arch,
  ignore: /node_modules|src|script|README|tslint\.json|tsconfig|package-lock\.json|\.git|\.vscode|\.npmrc|\.cache/,
  appCopyright: 'Copyright (C) 2017-2019 Toyobayashi',
  overwrite: true
}

if (process.env.npm_config_electron_mirror && process.env.npm_config_electron_mirror.indexOf('taobao') !== -1) {
  packagerOptions.download = {
    unsafelyDisableChecksums: true,
    mirrorOptions: {
      mirror: process.env.npm_config_electron_mirror.endsWith('/') ? process.env.npm_config_electron_mirror : (process.env.npm_config_electron_mirror + '/'),
      customDir: pkg.devDependencies.electron
    }
  }
}

if (process.platform === 'win32') {
  const iconPath = getPath(config.iconSrcDir, `${pkg.name}.ico`)
  if (existsSync(iconPath)) {
    packagerOptions.icon = iconPath
  }
} else if (process.platform === 'darwin') {
  const iconPath = getPath(config.iconSrcDir, `${pkg.name}.icns`)
  if (existsSync(iconPath)) {
    packagerOptions.icon = iconPath
  }
}

export { packagerOptions }
