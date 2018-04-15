import { Vue, Component } from 'vue-property-decorator'
@Component
export default class extends Vue {
  toggle () {
    this.playSe(this.cancelSe)
    this.$emit('toggle')
  }
}
