<template>
<input
  type="text"
  class="input-text"
  :value="value"
  @input="onInput($event.target)"
  :placeholder="placeholder"
  :style="{ height: height + 'px', width: width ? width + 'px' : undefined }">
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
@Component
export default class extends Vue {
  @Prop({ default: '' }) value: string | number
  @Prop({ default: 40 }) height: number
  @Prop() width: number
  @Prop({ default: '' }) placeholder: string
  @Prop() limit: [number, number]

  onInput (target: HTMLInputElement) {
    let v = target.value
    if (this.limit && this.limit.length) {
      if (Number(v) > this.limit[1]) {
        this.$emit('input', this.limit[1])
        target.value = this.limit[1] as any
      } else if (Number(v) < this.limit[0] || isNaN(Number(v)) || v === '') {
        this.$emit('input', this.limit[0])
        target.value = this.limit[0] as any
      } else {
        if (Number(v) !== parseInt(v, 10)) {
          this.$emit('input', parseInt(v, 10))
          target.value = parseInt(v, 10) as any
        } else {
          this.$emit('input', Number(v))
        }
      }
    } else {
      this.$emit('input', v)
    }
  }
}
</script>

<style scoped>
.input-text {
  background-color: #505050;
  font-family: "CGSS-B";
  font-size: 20px;
  color: #fff;
  border: 2px solid #909090;
  border-radius: 4px;
  padding: 5px;
  outline: 0;
  box-shadow: 0 1px 1px rgba(0,0,0,.75) inset;
  transition: border-color ease-in-out .15s;
}
.input-text:focus {
  border: 2px solid #f080e0;
}
.input-text[disabled] {
  background-color: #d030a0;
  user-select: none;
  cursor: not-allowed;
}
</style>
