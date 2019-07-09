import modalMixin from './modal-mixin'
import ProgressBar from '../../vue/component/ProgressBar.vue'

import Component, { mixins } from 'vue-class-component'

const { shell } = window.node.electron

@Component({
  components: {
    ProgressBar
  }
})
export default class extends mixins(modalMixin) {

  versionData: any = {}
  updateProgress: number = 0
  btnDisabled: boolean = false

  cancel () {
    this.updater.abort()
    this.close()
  }

  async showRepo () {
    this.playSe(this.enterSe)
    if (this.versionData.appZipUrl && process.env.NODE_ENV === 'production') {
      this.btnDisabled = true
      try {
        const result = await this.updater.download((status: any) => {
          this.updateProgress = status.loading
        })
        if (result) {
          this.updater.relaunch()
        } else {
          this.btnDisabled = false
          this.updateProgress = 0
        }
      } catch (err) {
        this.btnDisabled = false
        this.event.$emit('alert', this.$t('home.errorTitle'), err.message)
      }
    } else if (this.versionData.exeUrl) {
      shell.openExternal(this.versionData.exeUrl)
    } else if (this.versionData.zipUrl) {
      shell.openExternal(this.versionData.zipUrl)
    } else {
      shell.openExternal('https://github.com/toyobayashi/mishiro/releases')
    }

  }

  mounted () {
    this.$nextTick(() => {
      this.event.$on('versionCheck', (versionData: any) => {
        // tslint:disable-next-line: no-floating-promises
        import(/* webpackChunkName: "marked" */ 'marked').then(marked => {
          this.show = true
          this.visible = true
          versionData.description = (marked as any).default(versionData.release.body)
          this.versionData = versionData
        })
      })
    })
  }
}
