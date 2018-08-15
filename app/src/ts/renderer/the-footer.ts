import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
@Component
export default class extends Vue {
  @Prop() value: string

  blocks: string[] = ['home', 'idol', 'live', 'gacha', 'menu']

  @Emit()
  input (block: string) {
    if (block !== this.value) {
      this.event.$emit('changeBgm', block)
      this.playSe(this.enterSe)
    }
  }
}
