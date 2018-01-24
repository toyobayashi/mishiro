<template>
<div class="main-block-style">
  <div class="clearfix">
    <input type="text" class="db-query live-query" v-model="queryString" :placeholder="$t('live.input')"/>
    <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-10" @click="opendir">{{$t("home.opendir")}}</button>
    <!-- <button ref="stopBtn" class="cgss-btn cgss-btn-default pull-right margin-left-10" @click="stopDownload">{{$t("home.stop")}}</button>
    <button ref="downloadBtn" class="cgss-btn cgss-btn-star pull-right margin-left-10" @click="downloadAll">{{$t("home.download")}}</button> -->
    <button class="cgss-btn cgss-btn-ok pull-right margin-left-10" @click="query">{{$t("home.search")}}</button>
  </div>
  <div class="margin-top-10 clearfix live-middle">
    <div class="black-bg live-result absolute-left">
      <ul>
        <li :class="{active:activeAudio.fileName === i.fileName}" v-for="i in bgmManifest" v-text="i.fileName" @click="selectAudio(i)"></li>
      </ul>
    </div>
    <div class="black-bg live-result absolute-right">
      <ul v-if="allLive">
        <li :class="{active:activeAudio.fileName === i.fileName}" v-for="i in liveManifest" v-text="i.fileName" @click="selectAudio(i)"></li>
      </ul>
      <ul v-else>
        <li :class="{active:activeAudio.fileName === i.fileName}" v-for="i in liveQueryList" v-text="i.fileName" @click="selectAudio(i)"></li>
      </ul>
    </div>
  </div>
  
  <div class="margin-top-20 clearfix live-bottom">
    <task :total-loading="total" :current-loading="current" :text="text" :single="true" class="absolute-left" :color="'live'"></task>
    <div class="gray-bg absolute-right flex-center timebar">
      <p>{{Math.floor(currentTime) | time}} / {{Math.floor(duration) | time}}</p>
      <input type="range" ref="playProg" :max="duration" min="0" :value="currentTime" @input="oninput()">
    </div>
  </div>
</div>
</template>

<script src="../../js/live.js">
</script>

<style>
.timebar{
  font-family: "CGSS-B";
}
.absolute-left{
  position: absolute;
  left: 0;
  height: 100%;
  width: 49%;
}
.absolute-right{
  position: absolute;
  right: 0;
  height: 100%;
  width: 49%;
}
.live-middle{
  position: relative;
  height: calc(100% - 230px);
  width: 100%;
}
.live-bottom{
  position: relative;
  height: 110px;
  width: 100%;
}
.live-query{
  width: calc(100% - 370px);
}
.live-result>ul>li{
  cursor: pointer;
  height: 30px;
  border: 1px solid #000;
  background: linear-gradient(180deg,#f0f0f0,silver);
  font-family: "CGSS-B";
  font-size: 15px;
  padding-left: 5px;
  line-height: 30px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: #333 !important;
  text-align: left;
}
.live-result>ul>li.active{
  background: linear-gradient(180deg,#902070,#e070d0);
  color: #fff !important;
}

input[type=range] {
  display: block;
  position: relative;
  width: 90%;
  height: 30px;
  -webkit-appearance: none;
  background: none;
  outline: none;
}
input[type=range]::-webkit-slider-thumb:hover {
  background-color: #ddadd7;
}
input[type=range]::-webkit-slider-thumb:active {
  background-color: #e070d0;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background-color: #e0b5db;
  cursor: pointer;
  margin-top: -7px;
  -webkit-box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  background-color: #aaa;
  border-radius: 4px;
  cursor: pointer;
}
/*
input[type=range]::-webkit-fill-lower {
  background-color: #85b200;
}
input[type=range]::-webkit-fill-upper {
  background-color: #aaa;
}

input[type=range]::-webkit-ticks-before {
  display: none;
}
input[type=range]::-webkit-ticks-after {
  display: none;
}*/
</style>
