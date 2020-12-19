let cache: Record<string, any> = Object.create(null)

export function getCache (name: string): any {
  return cache[name]
}

export function setCache (name: string, value: any): void {
  cache[name] = value
}

export function clearCache (): void {
  cache = Object.create(null)
}

export function removeCache (name: string): void {
  if (Object.prototype.hasOwnProperty.call(cache, name)) {
    delete cache[name]
  }
}
