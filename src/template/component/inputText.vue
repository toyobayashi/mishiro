<template>
<input
  type="text"
  class="input-text"
  :value="value"
  @input="onInput($event.target)"
  :placeholder="placeholder"
  :style="{ height: height + 'px', width: width ? width + 'px' : undefined }">
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    height: {
      type: Number,
      default: 40
    },
    width: {
      type: Number
    },
    placeholder: {
      type: String,
      default: ''
    },
    limit: Array
  },
  methods: {
    onInput (target) {
      let v = target.value
      if (this.limit && this.limit.length) {
        if (Number(v) > this.limit[1]) {
          this.$emit('input', this.limit[1])
          target.value = this.limit[1]
        } else if (Number(v) < this.limit[0] || isNaN(Number(v)) || v === '') {
          this.$emit('input', this.limit[0])
          target.value = this.limit[0]
        } else {
          if (Number(v) !== parseInt(v)) {
            this.$emit('input', parseInt(v))
            target.value = parseInt(v)
          } else {
            this.$emit('input', Number(v))
          }
        }
      } else {
        this.$emit('input', v)
      }
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
