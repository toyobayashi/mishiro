import { Vue, Component, Prop } from 'vue-property-decorator'
@Component
export default class extends Vue {
  @Prop() currentBlock: string

  blocks: string[] = ['home', 'idol', 'live', 'gacha', 'menu']

  navToggle (block: string) {
    if (block !== this.currentBlock) {
      this.$emit('changeBlock', block)
      this.playSe(this.enterSe)
    }
  }
}
