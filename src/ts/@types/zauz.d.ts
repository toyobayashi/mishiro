declare module 'zauz' {
  export function zip (source: string, target: string): Promise<number>
  export function zip (source: string, target: string, callback: (err: Error | null, zipSize: number) => void): void
  export function unzip (source: string, target: string): Promise<number>
  export function unzip (source: string, target: string, callback: (err: Error | null, totalSize: number) => void): void
}
