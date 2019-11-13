<template>
<div class="cgss-footer">
  <ul>
    <li v-for="block in blocks" :key="block" :class="{ active: value === block}" @click="input(block)"></li>
  </ul>
</div>
</template>

<script lang="ts" src="../../ts/renderer/the-footer.ts">
</script>

<style scoped>
.cgss-footer{
  display: block;
  position: fixed;
  width: 612px;
  left: 50%;
  margin-left: -336px;
  bottom: 5px;
  z-index: 200;
}
.cgss-footer ul{
  list-style: none;
  height: 66px;
}
.cgss-footer ul li{
  cursor: pointer;
  float: left;
  display: block;
  width: 116px;
  height: 66px;
  text-decoration: none;
  background-image: url("../../asset/img.asar/footer.png");
}
.cgss-footer ul li:nth-child(1){
  width: 132px;
  background-position: 0 0;
}
.cgss-footer ul li:nth-child(1).active{
  background-position: 0 -66px;
}
.cgss-footer ul li:nth-child(2){
  background-position: -132px 0;
}
.cgss-footer ul li:nth-child(2).active{
  background-position: -132px -66px;
}
.cgss-footer ul li:nth-child(4){
  background-position: -364px 0;
}
.cgss-footer ul li:nth-child(4).active{
  background-position: -364px -66px;
}
/* .cgss-footer ul li:nth-child(4){
  background-position: -712px 0;
}
.cgss-footer ul li:nth-child(4).active{
  background-position: -712px -66px;
} */
.cgss-footer ul li:nth-child(3){
  background-position: -248px 0;
}
.cgss-footer ul li:nth-child(3).active{
  background-position: -248px -66px;
}
.cgss-footer ul li:nth-child(5){
  width: 132px;
  background-position: -828px 0;
}
.cgss-footer ul li:nth-child(5).active{
  background-position: -828px -66px;
}
</style>
