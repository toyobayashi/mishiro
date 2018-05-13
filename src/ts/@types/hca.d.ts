declare interface hca {
  dec: (hca: string, callback: (wavPath: string) => void) => void
  decSync: (hca: string) => string
}

declare namespace hca {
  type dec = (hca: string, callback: (wavPath: string) => void) => void
  type decSync = (hca: string) => string
}
