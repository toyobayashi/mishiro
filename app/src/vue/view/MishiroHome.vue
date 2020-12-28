<template>
<div class="main-block-style">
  <div class="clearfix">
    <InputText class="manifest-query" v-model="queryString" :placeholder="$t('home.input')"/>
    <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-10" @click="opendir">{{$t("home.opendir")}}</button>
    <button class="cgss-btn cgss-btn-default pull-right margin-left-10" @click="stopDownload">{{$t("home.stop")}}</button>
    <button :disabled="downloadBtnDisable" class="cgss-btn cgss-btn-star pull-right margin-left-10" @click="downloadSelectedItem">{{$t("home.download")}}</button>
    <button class="cgss-btn cgss-btn-ok pull-right margin-left-10" @click="query">{{$t("home.search")}}</button>
  </div>
  <div class="black-bg db-query-result margin-top-10" @mousewheel="onMouseWheel">
    <div style="position: absolute; top: 10px; width: calc(100% - 20px);">
      <div class="page-progress">
        <div class="progress-wrapper">
          <ProgressBar class="cgss-progress-event" :percent="current"/>
          <ProgressBar class="cgss-progress-event" :percent="total"/>
        </div>
        <div class="dl-options">
          <div class="auto-dec-lz4">
            <input type="checkbox" id="autoDecLz4" v-model="dler.autoDecLz4" /><label for="autoDecLz4"></label>
            <label for="autoDecLz4">{{$t('home.autoDecLz4')}}</label>
          </div>
          <button class="select-usm" @click="decryptUSM">{{$t('home.usmbtn')}}</button>
        </div>
        <button class="cgss-btn-lg cgss-btn-lg-ok" @click="filterOnClick">{{notDownloadedOnly ? $t("home.canDownload") : $t('home.all')}}</button>
        <div class="page-content">
          <span class="arrow previous" @click="previousPage"></span>
          <span class="bold">{{(page + 1) + ' / ' + (totalPage + 1)}}</span>
          <span class="arrow next" @click="nextPage"></span>
        </div>
      </div>
    </div>
    <TheTable :data="canDownloadRows.slice(page * recordPerPage, (page + 1) * recordPerPage)" @change="tableChange" :is-disabled="isDisabled" :formatter="tableFormatter" :header-formatter="headerFormatter" />
  </div>
  <!-- <TaskLoading :total-loading="total" :current-loading="current" :text="text" class="margin-top-20" :color="'event'"/> -->
</div>
</template>

<script lang="ts" src="../../ts/renderer/mishiro-home.ts">
</script>

<style>
.page-progress {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
}

.main-block-style .arrow {
  background-image: url("../../asset/img.asar/arrow.png");
  width: 40px;
  height: 66px;
  cursor: pointer;
}

.main-block-style .arrow.previous {
  background-position: 0 0;
}
.main-block-style .arrow.next {
  background-position: -40px 0;
}

.main-block-style .bold {
  font-family: 'CGSS-B';
  width: 140px;
  text-align: center;
}

.page-progress > .page-content {
  width: 220px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.page-progress > .progress-wrapper {
  width: calc(100% - 590px);
  height: 66px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.page-progress .dl-options {
  width: 150px;
  display: flex;
  flex-direction: column;
  /* justify-content: center; */
}
.page-progress .select-usm {
  cursor: pointer;
  font-family: 'CGSS-B';
  box-sizing: border-box;
  /* width: 30px; */
  width: 100%;
  height: 30px;
  background: -webkit-linear-gradient(225deg, #f0f0f0, #d0d0d0, #c0c0c0);
  border: 2px solid #000000;
  border-bottom: 4px solid #000000;
  border-radius: 5px;
  display: inline-block;
  position: relative;
}
.page-progress .select-usm:active {
  height: 28px;
  top: 2px;
  border-bottom: 2px solid #000000;
  background: -webkit-linear-gradient(225deg, #f0f0f0, #d0d0d0, #c0c0c0);
}
.page-progress .auto-dec-lz4 {
  font-family: 'CGSS-B';
}
.page-progress .auto-dec-lz4 > * {
  vertical-align: middle;
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
  overflow: auto;
  position: relative;
  padding-top: 85px;
  height: calc(100% - 93px);
}
</style>
