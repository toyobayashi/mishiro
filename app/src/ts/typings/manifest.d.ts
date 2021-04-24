declare interface ManifestResouce {
  name: string
  hash: string
  attr: number
  category: string
  size: number
  decrypt_key: null | Buffer
}

declare type ResourceData = Pick<ManifestResouce, 'name' | 'hash' | 'size'>
