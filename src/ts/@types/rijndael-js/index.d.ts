declare module 'rijndael-js' {
  export default class RijndaelBlock {
    constructor(key: string | Buffer | Array<number | string> | ArrayBuffer | Uint8Array, mode: string)
    encrypt(_plaintext: string | Buffer | Array<number | string> | ArrayBuffer | Uint8Array, blockSize: number, _iv: string | Buffer | Array<number | string> | ArrayBuffer | Uint8Array): Buffer
    decrypt(_ciphertext: string | Buffer | Array<number | string> | ArrayBuffer | Uint8Array, blockSize: number, _iv: string | Buffer | Array<number | string> | ArrayBuffer | Uint8Array): Buffer
  }
}
