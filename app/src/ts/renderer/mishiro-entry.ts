import { Vue, Component } from 'vue-property-decorator'
import getPath from '../common/get-path'
const fs = window.node.fs

@Component
export default class extends Vue {
  bg: boolean | null = null
  isTouched: boolean = false
  coverSrc: string = '../../asset/img.asar/title_bg_10008.png'

  enter (): void {
    if (!this.isTouched) {
      this.isTouched = true
      this.playSe(new Audio('../../asset/se.asar/se_title_start.mp3'))
      this.$emit('touch')
      setTimeout(() => {
        this.$emit('enter')
      }, 1000)
    }
  }

  beforeMount (): void {
    this.$nextTick(() => {
      const msrEvent = localStorage.getItem('msrEvent')
      if (msrEvent) {
        try {
          const o = JSON.parse(msrEvent)
          if (fs.existsSync(getPath.cardDir(`bg_${o.card}.png`))) {
            this.coverSrc = `../../asset/card/bg_${o.card}.png`
          }
        } catch (_) {
          localStorage.clear()
        }
      }
    })
  }

  showOption (btn: HTMLElement): void {
    btn.blur()
    this.playSe(this.enterSe)
    this.event.$emit('option', false)
  }

  mounted (): void {
    this.$nextTick(() => {
      this.bg = (window.innerWidth / window.innerHeight >= 1280 / 824)
      window.addEventListener('resize', () => {
        this.bg = (window.innerWidth / window.innerHeight >= 1280 / 824)
      }, false)
    })
  }
}
