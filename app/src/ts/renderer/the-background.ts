import { Vue, Component } from 'vue-property-decorator'
@Component
export default class extends Vue {
  bg: boolean | null = null
  backgroundId: boolean | number = false

  mounted (): void {
    this.$nextTick(() => {
      this.bg = (window.innerWidth / window.innerHeight >= 1280 / 824)
      window.addEventListener('resize', () => {
        this.bg = (window.innerWidth / window.innerHeight >= 1280 / 824)
      }, false)
      this.event.$on('eventBgReady', (cardId: number) => {
        this.backgroundId = cardId
      })
      this.event.$on('idolSelect', (cardId: number) => {
        this.backgroundId = cardId
      })
      this.event.$on('noBg', () => {
        this.backgroundId = false
      })
    })
  }
}
