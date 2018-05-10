<template>
<div class="main-block-style">
  <div class="gray-area idol-result pull-left margin-right-20">
    <ul>
      <li :class="{active:activeCard.name === i.name}" v-for="i in searchResult" v-text="i.name" @click="selectedIdol(i)"></li>
    </ul>
  </div>
  <div>
    <InputText class="idol-query" v-model="queryString" :placeholder="$t('idol.input')" />
    <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-10" @click="opendir">{{$t("home.opendir")}}</button>
    <button class="cgss-btn cgss-btn-star pull-right margin-left-10" @click="downloadVoice" ref="voiceBtn">{{$t("idol.voiceBtn")}}</button>
    <button class="cgss-btn cgss-btn-ok pull-right margin-left-10" @click="query">{{$t("home.search")}}</button>
  </div>
  <div class="black-bg idol-info margin-top-10">
    <div class="clearfix">
      <ProgressBar class="cgss-progress-stamina pull-left" :percent="imgProgress"/>
      <TabSmall class="pull-right" :tab="practice" v-model="currentPractice" @tabClicked="toggle"/>
    </div>
    <table class="table-bordered" border="1" :class="{
      cute: information.charaData ? information.charaData.type === 1 : false,
      cool: information.charaData ? information.charaData.type === 2 : false,
      passion: information.charaData ? information.charaData.type === 3 : false
    }">
      <tr v-for="line in table">
        <td :width="line[0].width || '15%'" :class="line[0].class" :colspan="line[0].colspan || 1">{{line[0].text}}</td>
        <td :width="line[1].width || '35%'" :class="line[1].class" :colspan="line[1].colspan || 1">{{line[1].text}}</td>
        <td :width="line[2].width || '15%'">{{line[2].text}}</td>
        <td :width="line[3].width || '35%'" v-if="line[3]">{{line[3].text}}</td>
      </tr>
      <tr v-if="activeCard.limited">
        <td>{{$t("idol.limited")}}</td>
        <td colspan="3"><p v-for="limit in activeCard.limited">{{"(" + (limit.id > 9999 ? $t("idol.gacha") + limit.id : $t("idol.event") + limit.id) + ") " + limit.name + ": " + limit.startDate + " ～ " + limit.endDate}}</p></td>
      </tr>
    </table>
  </div>
</div>
</template>

<script lang="ts" src="../../ts/renderer/mishiro-idol.ts">
</script>

<style>
.cute>tr>td:nth-last-child(1), .cute>tr>td:nth-last-child(2){
  color: #f090a0;
}
.cool>tr>td:nth-last-child(1), .cool>tr>td:nth-last-child(2){
  color: #a0f0f0;
}
.passion>tr>td:nth-last-child(1), .passion>tr>td:nth-last-child(2){
  color: #f0c080;
}
.hp {
  color: #90e0c0;
}
.vocal {
  color: #f090a0;
}
.dance {
  color: #a0f0f0;
}
.visual {
  color: #f0c080;
}
.table-bordered{
  border: 1px solid #ddd;
  border-spacing: 0;
  border-collapse: collapse;
  width: 100%;
  max-width: 100%;
}
.table-bordered>tr>td:nth-child(1), .table-bordered>tr>td:nth-last-child(2){
  text-align: center;
}
.table-bordered>tr>td:nth-last-child(3), .table-bordered>tr>td:nth-last-child(1){
  padding-left: 5px;
}
.idol-info{
  height: calc(100% - 93px);
}
.idol-info>div>.cgss-progress-stamina{
  width: calc(100% - 200px);
}
.idol-info>div>.pull-right{
  position: relative;
  top: -5px;
}
.idol-query{
  margin: 12px 0;
  width: calc(100% - 850px);
}
.idol-result{
  width: 300px;
  height: calc(100% - 20px);
}
.idol-result>ul>li{
  cursor: pointer;
  display: flex;
  height: 30px;
  border: 1px solid #000;
  background: linear-gradient(180deg,#f0f0f0,silver);
  font-family: "CGSS-B";
  font-size: 15px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.idol-result>ul>li.active{
  background: linear-gradient(180deg,#902070,#e070d0);
  color: #fff;
}
.text-left {
  text-align: left !important;
}
</style>
