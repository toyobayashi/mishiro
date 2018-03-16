<template>
<div style="display:flex;align-items:center">
  <input type="radio" :checked="selected === value" :value="value" :id="lableId" @change="onInput($event.target.value)" />
  <label :for="lableId"></label>
  <span>{{text}}</span>
</div>
</template>

<script>
export default {
  model: {
    prop: 'selected',
    event: 'check'
  },
  props: {
    selected: {},
    lableId: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    text: {
      type: String,
      required: true
    }
  },
  methods: {
    onInput (v) {
      this.$emit('check', v)
    }
  }
}
</script>

<style>
input[type="radio"] {
  display: none !important;
}
input[type="radio"] + label {
  box-sizing: border-box;
  width: 30px;
  height: 30px;
  background: #f0f0f0;
  border: 2px solid #000000;
  border-radius: 50%;
  display: inline-block;
  padding: 4px;
  position: relative;
}
input[type="radio"] + label:after {
  content: " ";
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: -webkit-linear-gradient(270deg, #a0a0a0, #c8c8c8, #f0f0f0);
}
input[type="radio"]:active + label:after {
  background: -webkit-linear-gradient(270deg, #909090, #c8c8c8, #f0f0f0);
}
input[type="radio"]:checked + label:after {
  background: -webkit-radial-gradient(
    25% 25%,
    closest-corner,
    #f0f0f0,
    #d030a0
  );
}
</style>
