<template>
<ul class="cgss-tab-sm clearfix">
  <li
    v-for="item in tab"
    :key="item"
    @click="liClick(item)"
    :style="{ fontSize: fontSize + 'px' }"
    :class="{ active: item === value }">{{noTranslation ? item : $t(item)}}</li>
</ul>
</template>

<script lang="ts" src="../../ts/renderer/tab-small.ts">
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
  background-image: url("../../asset/img.asar/tab_small.png");
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
