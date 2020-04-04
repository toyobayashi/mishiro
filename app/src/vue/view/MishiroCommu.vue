<template>
<div class="main-block-style">
  <div class="toolbar">
    <InputText class="id-query" v-model="queryString" :placeholder="$t('commu.id')" />
    <button class="cgss-btn cgss-btn-ok margin-left-10" @click="query">{{$t("home.search")}}</button>
    <button class="cgss-btn cgss-btn-ok margin-left-10" @click="save">{{$t("menu.save")}}</button>
  </div>
  <div class="result gray-area">
    <canvas id="can" width='811' height='124'></canvas>
    <img v-if="isSearching" :src="'../../asset/img.asar/spinner.gif'" class="id-loading" />
  </div>
  <div class="black-bg intro">
    {{$t("commu.originalSite")}}: <span class="link" @click="openOrigin">プロデューサー検索 - deresute.me https://deresute.me</span>
  </div>
</div>
</template>

<script lang="ts" src="../../ts/renderer/mishiro-commu.ts">
</script>

<style scoped>
.link {
  cursor: pointer;
  color: rgb(164, 255, 232);
}
.toolbar {
  display: flex;
  align-items: center;
  width: 811px;
  margin: 0 auto;
}
.id-query {
  /* width: calc(100% - 500px); */
  flex: 1;
}
.result {
  width: 831px;
  height: 144px;
  margin: 50px auto;
  position: relative;
}
.intro {
  font-family: 'CGSS-B';
  width: 811px;
  margin: 0 auto;
  font-size: 20px;
}
.id-loading {
  position: absolute;
  top: calc(50% + 10px);
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
