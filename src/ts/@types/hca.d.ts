type decodeCallback = (err: Error | null, wavFilePath?: string) => void

declare class HCADecoder {
  constructor(cipherKey1?: number, cipherKey2?: number)

  decodeToWaveFile (filenameHCA: string, callback?: decodeCallback): void
  decodeToWaveFile (filenameHCA: string, filenameWAV: string, callback?: decodeCallback): void
  decodeToWaveFile (filenameHCA: string, filenameWAV: string, volume: number, callback?: decodeCallback): void
  decodeToWaveFile (filenameHCA: string, filenameWAV: string, volume: number, mode: number, callback?: decodeCallback): void
  decodeToWaveFile (filenameHCA: string, filenameWAV: string, volume: number, mode: number, loop: number, callback?: decodeCallback): void

  decodeToWaveFileSync (filenameHCA: string): string | void
  decodeToWaveFileSync (filenameHCA: string, filenameWAV: string): string | void
  decodeToWaveFileSync (filenameHCA: string, filenameWAV: string, volume: number): string | void
  decodeToWaveFileSync (filenameHCA: string, filenameWAV: string, volume: number, mode: number): string | void
  decodeToWaveFileSync (filenameHCA: string, filenameWAV: string, volume: number, mode: number, loop: number): string | void

  printInfo (filenameHCA: string): void
  decrypt (filenameHCA: string): string | void
}
