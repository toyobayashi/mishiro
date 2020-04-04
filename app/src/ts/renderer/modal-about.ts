import modalMixin from './modal-mixin'
import Component, { mixins } from 'vue-class-component'

@Component
export default class extends mixins(modalMixin) {
  app = window.node.electron.remote.app
  versions = window.node.process.versions
  arch = window.node.process.arch
  osinfo!: string
  commit = process.env.NODE_ENV === 'production' ? window.preload.package._commit : window.node.childProcess.execSync('git rev-parse HEAD', { cwd: window.preload.getPath() }).toString().replace(/[\r\n]/g, '')
  commitDate = process.env.NODE_ENV === 'production' ? window.preload.package._commitDate : new Date((window.node.childProcess.execSync('git log -1', { cwd: window.preload.getPath() }).toString().match(/Date:\s*(.*?)\n/) as RegExpMatchArray)[1]).toISOString()

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
