<template>
  <div class="hp-bar">
    <div><div class="hp" :class="{ 'warning': hp > 20 && hp <= 40, 'dangerous': hp <= 20 }" :style="{ width: hp + '%' }"></div></div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
@Component
export default class extends Vue {
  @Prop() hp: number
}
</script>

<style scoped>
.hp-bar{
	position: absolute;
	top: 5%;
	left: 10%;
	box-sizing: border-box;
	width: 231px;
	height: 28px;
	border: 1px solid #505050;
	background: #f0f0f0;
	border-radius: 5px;
}
.hp-bar>div{
	position: relative;
	box-sizing: border-box;
	width: 215px;
	height: 20px;
	background: linear-gradient(180deg, #606060, #808080);
	border-radius: 4px;
	margin: 3px 7px;
	overflow: hidden;
}
.hp-bar .hp{
	background: linear-gradient(180deg, #40d000, #b0f070 30%, #50d030);
	width: 80.5%;
	height: 20px;
	transition: width .2s linear;
}
.hp-bar .hp.warning{
	background: linear-gradient(180deg, #f0c010, #f0e080 30%, #f0a000);
}
.hp-bar .hp.dangerous{
	background: linear-gradient(180deg, #e04000, #f08070 30%, #c04000);
}
</style>
