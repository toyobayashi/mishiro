import { BrowserWindowConstructorOptions, nativeImage, app } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs-extra'

export default function setIcon (options: BrowserWindowConstructorOptions): BrowserWindowConstructorOptions {
  if (process.platform === 'linux') {
    let linuxIcon: string
    try {
      linuxIcon = join(__dirname, '../../icon/1024x1024.png')
    } catch (_) {
      linuxIcon = ''
    }
    if (linuxIcon) {
      options.icon = nativeImage.createFromPath(join(__dirname, linuxIcon))
    }
  } else {
    if (process.env.NODE_ENV !== 'production') {
      let icon: string = ''

      const iconPath = join(__dirname, `../../../src/res/icon/${process.platform === 'darwin' ? '1024x1024.png' : 'app.ico'}`)
      if (existsSync(iconPath)) icon = iconPath

      if (icon) {
        if (process.platform === 'darwin') {
          app.dock.setIcon(icon)
        } else {
          options.icon = nativeImage.createFromPath(icon)
        }
      }
    }
  }
  return options
}
