declare interface Window {
  preload: {
    package: any
    configurer: import('../main/config').Configurer
    client: import('mishiro-core').Client
    getPath: typeof import('../main/get-path').default
    updater: import('electron-github-asar-updater')
    getManifestDB (): import('../main/db').default | undefined
    // getMasterDB (): import('../main/db').default | undefined
    readManifest?: typeof import('../main/on-manifest-read').default
    // readMaster: typeof import('../main/on-master-read').default
    // queryManifest (queryString: string): any[]
    getLyrics: typeof import('../main/on-lyrics').default
    getScoreDifficulties: typeof import('../main/on-check-score').default
    getScore: typeof import('../main/on-score').default
  }
  node: {
    process: {
      versions: typeof process.versions
      arch: typeof process.arch
      platform: typeof process.platform
    }
    got: typeof import('got')
    electron: typeof import('electron')
    mishiroCore: typeof import('mishiro-core')
    fs: typeof import('fs-extra')
    os: {
      type: typeof import('os').type
      release: typeof import('os').release
    }
    path: typeof import('path')
    url: typeof import('url')
    childProcess: {
      execSync: typeof import('child_process').execSync
    }
  }
}
