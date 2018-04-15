import StaticTitleDot from '../../vue/component/StaticTitleDot.vue'
import { Vue, Component } from 'vue-property-decorator'
@Component({
  components: {
    StaticTitleDot
  }
})
export default class extends Vue {

  show: boolean = false
  visible: boolean = false
  bodyMaxHeight: string = window.innerHeight - 267 + 'px'
  modalWidth: string = '600px'

  close () {
    this.playSe(this.cancelSe)
    this.visible = false
  }
  afterLeave () {
    this.show = false
  }

  mounted () {
    this.$nextTick(() => {
      window.addEventListener(
        'resize',
        () => {
          this.bodyMaxHeight = window.innerHeight - 267 + 'px'
        },
        false
      )
      this.event.$on('escKey', () => {
        if (this.visible) {
          this.close()
        }
      })
    })
  }
}
