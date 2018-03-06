<template>
<ul class="cgss-tab-sm clearfix">
  <li
    v-for="item in tab"
    @click="liClick(item)"
    :style="{ fontSize: fontSize + 'px' }"
    :class="{ active: item === value }">{{noTranslation ? item : $t(item)}}</li>
</ul>
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'tabClicked'
  },
  props: {
    tab: {
      type: Object,
      required: true,
      default: {}
    },
    value: {
      type: String
    },
    noTranslation: {
      type: Boolean,
      default: false
    },
    fontSize: {
      type: Number,
      default: 18
    }
  },
  data () {
    return {
      currentActive: this.value
    }
  },
  methods: {
    liClick (item) {
      if (item !== this.value) {
        this.playSe(this.enterSe)
        this.$emit('tabClicked', item)
      }
    }
  }
}
</script>

<style>
.cgss-tab-sm{
  display: block;
  list-style: none;
}
.cgss-tab-sm>li{
  float: left;
  cursor: pointer;
  display: block;
  background-image: url("../../res/img/tabSm.png");
  text-decoration:none;
  text-align: center;
  height: 32px;
  line-height: 32px;
  color: #323232;
  font-family: "CGSS-B";
  /* font-size: 18px; */
}
.cgss-tab-sm>li:first-child{
  width: 96px;
  background-position: 0 0;
}
.cgss-tab-sm>li:first-child.active{
  width: 96px;
  background-position: 0 -32px;
}
.cgss-tab-sm>li{
  width: 92px;
  background-position: -96px 0;
}
.cgss-tab-sm>li.active{
  width: 92px;
  background-position: -96px -32px;
  color:#fff;
  /*-webkit-text-stroke:1px rgb(80,17,63);*/
}
.cgss-tab-sm>li:last-child{
  width: 96px;
  background-position: -188px 0;
}
.cgss-tab-sm>li:last-child.active{
  background-position: -188px -32px;
}
</style>