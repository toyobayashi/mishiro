import { Vue, Component, Prop, Model } from 'vue-property-decorator'
@Component
export default class extends Vue {

  @Model('tabClicked') value: string
  @Prop({ required: true, default: () => ({}), type: Object }) tab: any
  @Prop({ default: false }) noTranslation: boolean
  @Prop({ default: 18 }) fontSize: number
  /* model: {
    prop: 'value',
    event: 'tabClicked'
  }, */
  // currentActive: string = this.value

  /* playSe: Function
  enterSe: HTMLAudioElement */

  liClick (item: string) {
    if (item !== this.value) {
      this.playSe(this.enterSe)
      this.$emit('tabClicked', item)
    }
  }
}
