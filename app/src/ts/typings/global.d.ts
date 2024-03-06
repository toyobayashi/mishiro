declare interface IBatchError {
  path: string
  code: number
  message: string
}

declare const MISHIRO_DEV_SERVER_PORT: number

declare module 'mishiro-core/util/proxy' {
  export function getProxyAgent (proxy?: string): {
    http?: import('http').Agent
    https?: import('https').Agent
  } | false
}
