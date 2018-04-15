<template>
<div class="main-block-style">
  <div class="clearfix">
    <InputText class="manifest-query" v-model="queryString" :placeholder="$t('home.input')"/>
    <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-10" @click="opendir">{{$t("home.opendir")}}</button>
    <button ref="stopBtn" class="cgss-btn cgss-btn-default pull-right margin-left-10" @click="stopDownload">{{$t("home.stop")}}</button>
    <button ref="downloadBtn" class="cgss-btn cgss-btn-star pull-right margin-left-10" @click="downloadSelectedItem">{{$t("home.download")}}</button>
    <button class="cgss-btn cgss-btn-ok pull-right margin-left-10" @click="query">{{$t("home.search")}}</button>
  </div>
  <div class="black-bg db-query-result margin-top-10">
    <TheTable :data="data" @change="tableChange" :is-disabled="isDisabled"/>
  </div>
  <TaskLoading :total-loading="total" :current-loading="current" :text="text" class="margin-top-20" :color="'event'"/>
</div>
</template>

<script lang="ts" src="../../js/renderer/mishiro-home.ts">
</script>

<style>
.manifest-query{
  margin: 12px 0;
  width: calc(100% - 690px);
}
.main-block-style{
  position: absolute;
  width: calc(100% - 140px);
  height: calc(100% - 138px);
  left: 70px;
  top: 70px;
  overflow: hidden;
}
.db-query-result{
  height: calc(100% - 270px);
}
</style>
