import modalMixin from './modal-mixin'
import Component, { mixins } from 'vue-class-component'
import { getAppName, getAppVersion, getPackageJson } from './ipc'
import getPath from './get-path'
const pkg = getPackageJson()

@Component
export default class extends mixins(modalMixin) {
  appName = getAppName()
  appVersion = getAppVersion()
  versions = window.node.process.versions
  arch = window.node.process.arch
  osinfo!: string
  commit = process.env.NODE_ENV === 'production' ? pkg._commit : window.node.childProcess.execSync('git rev-parse HEAD', { cwd: getPath() }).toString().replace(/[\r\n]/g, '')
  commitDate = process.env.NODE_ENV === 'production' ? pkg._commitDate : new Date((window.node.childProcess.execSync('git log -1', { cwd: getPath() }).toString().match(/Date:\s*(.*?)\n/) as RegExpMatchArray)[1]).toISOString()

  showRepo (): void {
    window.node.electron.shell.openExternal('https://github.com/toyobayashi/mishiro').catch(err => console.log(err))
    this.playSe(this.enterSe)
  }

  created (): void {
    this.osinfo = `${window.node.os.type()} ${this.arch} ${window.node.os.release()}`
  }

  mounted (): void {
    this.$nextTick(() => {
      this.event.$on('showAbout', () => {
        this.show = true
        this.visible = true
      })
    })
  }
}
