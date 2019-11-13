let cache: { [key: string]: any } = {}

export function getCache (name: string): any {
  return cache[name]
}

export function setCache (name: string, value: any): void {
  cache[name] = value
}

export function clearCache (): void {
  cache = {}
}

export function removeCache (name: string): void {
  if (Object.prototype.hasOwnProperty.call(cache, name)) {
    delete cache[name]
  }
}
