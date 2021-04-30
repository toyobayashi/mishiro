declare interface Window {
  node: {
    process: typeof process
    electron: typeof import('electron')
    tybys: {
      downloader: typeof import('@tybys/downloader')
    }
    mishiroCore: typeof import('mishiro-core')
    fs: typeof import('fs-extra')
    os: typeof import('os')
    path: typeof import('path')
    url: typeof import('url')
    childProcess: typeof import('child_process')
  }
}
