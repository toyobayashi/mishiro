declare interface Window {
  preload: {
    configurer: {
      getAll (): import('../main/config').MishiroConfig
      get<K extends import('../main/config').MishiroConfigKey> (key: K): import('../main/config').MishiroConfig[K]
      set (key: import('../main/config').MishiroConfig): void
      set<K extends import('../main/config').MishiroConfigKey> (key: K, value: import('../main/config').MishiroConfig[K]): void
      remove (key: import('../main/config').MishiroConfigKey): void
    }
    getPath: typeof import('../main/get-path').default
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
