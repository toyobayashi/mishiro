<template>
<button class="hideButton" @click="toggle"></button>
</template>

<script lang="ts" src="../../ts/renderer/the-toggle-button.ts">
</script>

<style scoped>
.hideButton{
  position:absolute;
  top:5px;
  right:5px;
  width:65px;
  height:65px;
  background-image:url('../../asset/img.asar/button_toggle.png');
  background-position:0 -65px;
  cursor: pointer;
}
.hideButton:active{
  background-position:0 0;
}
</style>

