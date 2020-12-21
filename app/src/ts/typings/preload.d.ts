declare interface Window {
  preload: {
    getManifestDB (): import('../main/db').default | undefined
    readManifest?: typeof import('../main/on-manifest-read').default
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
