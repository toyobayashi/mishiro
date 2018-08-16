<template>
<div class="main-block-style">
  <div class="clearfix">
    <InputText class="manifest-query" v-model="queryString" :placeholder="$t('home.input')"/>
    <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-10" @click="opendir">{{$t("home.opendir")}}</button>
    <button class="cgss-btn cgss-btn-default pull-right margin-left-10" @click="stopDownload">{{$t("home.stop")}}</button>
    <button :disabled="downloadBtnDisable" class="cgss-btn cgss-btn-star pull-right margin-left-10" @click="downloadSelectedItem">{{$t("home.download")}}</button>
    <button class="cgss-btn cgss-btn-ok pull-right margin-left-10" @click="query">{{$t("home.search")}}</button>
  </div>
  <div class="black-bg db-query-result margin-top-10">
    <div style="position: absolute; top: 0; width: calc(100% - 20px);">
      <div class="page-head">
        <span @click="page !== 0 ? page -= 1 : page = totalPage">previos</span>
        <span>{{(page + 1) + ' / ' + (totalPage + 1)}}</span>
        <span @click="page !== totalPage ? page += 1 : page = 0">next</span>
      </div>
      <ProgressBar class="cgss-progress-event" :percent="current"/>
      <ProgressBar class="cgss-progress-event" :percent="total"/>
    </div>
    <TheTable :data="data.slice(page * recordPerPage, (page + 1) * recordPerPage)" @change="tableChange" :is-disabled="isDisabled"/>
  </div>
  <!-- <TaskLoading :total-loading="total" :current-loading="current" :text="text" class="margin-top-20" :color="'event'"/> -->
</div>
</template>

<script lang="ts" src="../../ts/renderer/mishiro-home.ts">
</script>

<style>
.page-head {
  display: flex;
  justify-content: space-around;
}
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
  overflow: hidden;
  position: relative;
  padding-top: 80px;
  height: calc(100% - 130px);
}
</style>
