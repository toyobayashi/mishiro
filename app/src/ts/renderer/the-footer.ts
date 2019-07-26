import { Vue, Component, Prop } from 'vue-property-decorator'
@Component
export default class extends Vue {
  @Prop() value: string

  blocks: string[] = ['home', 'idol', 'live', 'gacha', 'menu']

  input (block: string) {
    if (block !== this.value) {
      // if (block === 'gacha') {
      //   this.event.$emit('alert', this.$t('home.errorTitle'), 'GACHA part has been disabled.')
      //   return
      // }
      this.event.$emit('changeBgm', block)
      this.playSe(this.enterSe)
      this.$emit('input', block)
    }
  }
}
