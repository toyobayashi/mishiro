declare interface Window {
  preload: {
    package: any
    configurer: import('../main/config').Configurer
    client: import('mishiro-core').Client
    getPath: typeof import('../main/get-path').default
    updater: import('electron-github-asar-updater')
  }
  node: {
    process: {
      versions: typeof process.versions
      arch: typeof process.arch
    }
    got: typeof import('got')
    electron: typeof import('electron')
    mishiroCore: typeof import('mishiro-core')
    fs: typeof import('fs-extra')
    path: typeof import('path')
    url: typeof import('url')
    childProcess: {
      execSync: typeof import('child_process').execSync
    }
  }
}
