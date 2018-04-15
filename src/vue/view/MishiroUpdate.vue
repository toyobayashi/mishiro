<template>
<div class="black">
  <div class="lb" v-show="isTouched">
    <p>{{text}}</p>
    <ProgressBar class="cgss-progress-load" :percent="loading"/>
    <p>{{$t("update.tip")}}</p>
  </div>
  <img :src="'./img/img.asar/spinner.gif'" class="spinner" v-show="isTouched"/>
</div>
</template>

<style scoped>
.black{
  position: absolute; 
  z-index: 900;
  font-family: "CGSS-B";
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-end;
  width: 100%;
  height: 100%;
  background-color: #000;
}
.lb{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  padding: 20px;
  margin: 40px;
  width: 45%;
  height: 20%;
  background-color: #aaa;
}
</style>

<script lang="ts" src="../../js/renderer/mishiro-update.ts">
</script>