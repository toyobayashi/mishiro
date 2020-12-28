import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
@Component
export default class extends Vue {
  @Prop({
    type: Array,
    default: () => ([])
  })
  data: any[]

  @Prop({ type: Function, required: true })
  isDisabled: (obj: any) => boolean

  @Prop({
    type: Function,
    default: (_key: string, value: any) => {
      return value
    }
  })
  formatter: (key: string, value: any) => string

  @Prop({
    type: Function,
    default: (key: string) => key
  })
  headerFormatter: (key: string) => string

  selected: any[] = []
  selectAll: boolean = false

  change (selected: any[]): void {
    this.$emit('change', selected)
  }

  @Watch('selectAll')
  selectAllWatchHandler (val: boolean): void {
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

  mounted (): void {
    this.$nextTick(() => {
      this.event.$on('completeTask', (name: string, disable: boolean = true) => {
        for (let i = 0; i < this.selected.length; i++) {
          if (this.selected[i].name === name ||
            this.selected[i].name === 'b/' + name ||
            this.selected[i].name === 'c/' + name ||
            this.selected[i].name === 'l/' + name ||
            this.selected[i].name === 'r/' + name ||
            this.selected[i].name === 'v/' + name) {
            if (disable) {
              const o = document.getElementById(this.selected[i].hash)
              if (o) o.setAttribute('disabled', 'disabled')
            }
            this.selected.splice(i, 1)
            break
          }
        }
      })
    })
  }
}
