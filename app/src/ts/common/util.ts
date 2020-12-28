export function formatSize (b: number): string {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${Math.floor(b / 1024)} KB`
  if (b < 1024 * 1024 * 1024) return `${Math.floor(b / 1024 / 1024 * 100) / 100} MB`
  if (b < 1024 * 1024 * 1024 * 1024) return `${Math.floor(b / 1024 / 1024 / 1024 * 100) / 100} GB`
  return `${b}`
}
