<template>
<ul class="cgss-tab-sm clearfix">
  <li v-for="item in tab" @click="liClick(item)" :style="{ fontSize: fontSize + 'px' }" :class="{ active: currentActive === item }">{{noTranslation ? item : $t(item)}}</li>
</ul>
</template>

<script>
export default {
  props: {
    tab: {
      type: Object,
      required: true,
      default: {}
    },
    default: {
      type: String,
      required: true
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
      currentActive: this.tab[this.default]
    }
  },
  methods: {
    liClick (item) {
      if (item !== this.currentActive) {
        this.playSe(this.enterSe)
        this.currentActive = item
        this.$emit('tabClicked', item)
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.event.$on('smallTab', (key) => {
        if (this.tab[key]) {
          this.currentActive = this.tab[key]
        }
      })
    })
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