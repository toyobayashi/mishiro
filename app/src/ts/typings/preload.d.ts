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
    process: typeof process
    got: typeof import('got')
    electron: typeof import('electron')
    mishiroCore: typeof import('mishiro-core')
    fs: typeof import('fs-extra')
    os: typeof import('os')
    path: typeof import('path')
    url: typeof import('url')
    childProcess: typeof import('child_process')
  }
}
