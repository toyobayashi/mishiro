interface hca {
  dec(hca: string, callback: Function): void
  decSync(hca: string): string
}
export function dec(hca: string, callback: Function): void
export function decSync(hca: string): string
export default hca
