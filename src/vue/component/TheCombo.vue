<template>
  <div class="combo" v-show="combo > 0">
    <span class="combo-number">{{combo}}</span>
    <span class="combo-text">combo</span>
  </div>
</template>

<script>
export default {
  props: {
    combo: Number
  }
}
</script>

<style scoped>
.combo {
	position: absolute;
	top: 5%;
  right: 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.combo > .combo-number {
	-webkit-text-stroke: 2px rgb(240,144,0);
	color: #f0f0f0;
	font-size: 80px;
	font-family: "CGSS-B";
  font-weight: bold;
  height: 80px;
  line-height: 80px;
}
.combo > .combo-text {
	-webkit-text-stroke: 2px rgb(240,144,0);
	color: #f0f0f0;
	font-size: 40px;
  font-family: "CGSS-B";
  height: 40px;
  line-height: 40px;
}
</style>
