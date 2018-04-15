import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator'
@Component
export default class extends Vue {
  @Prop() data: any[]
  @Prop() isDisabled: Function

  selected: any[] = []
  selectAll: boolean = false

  @Emit()
  change (_selected: any[]) {
    // this.$emit('change', this.selected)
  }

  @Watch('selectAll')
  selectAllWatchHandler (val: boolean) {
    if (val) {
      this.selected = []
      for (let i = 0; i < this.data.length; i++) {
        if (!this.isDisabled(this.data[i])) {
          this.selected.push(this.data[i])
        }
      }
    } else {
      this.selected = []
    }
    this.$emit('change', this.selected)
  }

  mounted () {
    this.$nextTick(() => {
      this.event.$on('completeTask', (name: string) => {
        for (let i = 0; i < this.selected.length; i++) {
          if (this.selected[i].name === name ||
            this.selected[i].name === 'b/' + name ||
            this.selected[i].name === 'c/' + name ||
            this.selected[i].name === 'l/' + name ||
            this.selected[i].name === 'r/' + name ||
            this.selected[i].name === 'v/' + name) {
            let o = document.getElementById(this.selected[i].hash)
            if (o) o.setAttribute('disabled', 'disabled')
            this.selected.splice(i, 1)
            break
          }
        }
      })
    })
  }
}
