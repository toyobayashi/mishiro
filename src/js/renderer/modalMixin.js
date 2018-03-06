import titleDot from '../../vue/component/titleDot.vue'
export default {
  components: {
    titleDot
  },
  data () {
    return {
      show: false,
      visible: false,
      bodyMaxHeight: window.innerHeight - 267 + 'px',
      modalWidth: '600px'
    }
  },
  methods: {
    close () {
      this.playSe(this.cancelSe)
      this.visible = false
    },
    afterLeave () {
      this.show = false
    }
  },
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
