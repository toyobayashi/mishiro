import modalMixin from './modal-mixin'
import Component, { mixins } from 'vue-class-component'

@Component
export default class extends mixins(modalMixin) {
  modalWidth = '800px'
  errorList: IBatchError[] = []

  afterLeave (): void {
    this.show = false
    this.errorList = []
    this.modalWidth = '800px'
  }

  mounted (): void {
    this.$nextTick(() => {
      this.event.$on('alertBatchError', (errorList: IBatchError[]) => {
        this.errorList = errorList ?? []
        this.show = true
        this.visible = true
      })
    })
  }
}
