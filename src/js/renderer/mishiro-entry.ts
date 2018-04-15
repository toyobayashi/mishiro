import * as fs from 'fs'
import getPath from '../common/get-path'
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class extends Vue {

  bg: boolean | null = null
  isTouched: boolean = false
  coverSrc: string = './img/img.asar/2ndAnniversary.jpg'

  enter () {
    if (!this.isTouched) {
      this.isTouched = true
      this.playSe(new Audio('./asset/sound/se.asar/se_title_start.mp3'))
      this.$emit('touch')
      setTimeout(() => {
        this.$emit('enter')
      }, 1000)
    }
  }

  beforeMount () {
    this.$nextTick(() => {
      let msrEvent = localStorage.getItem('msrEvent')
      if (msrEvent) {
        let o = JSON.parse(msrEvent)
        if (fs.existsSync(getPath(`./public/img/card/bg_${o.card}.png`))) {
          this.coverSrc = `./img/card/bg_${o.card}.png`
        }
      }
    })
  }
  mounted () {
    this.$nextTick(() => {
      this.bg = (window.innerWidth / window.innerHeight >= 1280 / 824)
      window.addEventListener('resize', () => {
        this.bg = (window.innerWidth / window.innerHeight >= 1280 / 824)
      }, false)
    })
  }
}
