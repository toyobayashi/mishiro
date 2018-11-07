<template>
<div class="main-block-style">
  <div class="clearfix">
    <InputText class="live-query" v-model="queryString" :placeholder="$t('live.input')"/>
    <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-10" @click="opendir">{{$t("home.opendir")}}</button>
    <button class="cgss-btn cgss-btn-star pull-right margin-left-10" @click="startGame">{{$t("live.live")}}</button>
    <!-- <button ref="downloadBtn" class="cgss-btn cgss-btn-star pull-right margin-left-10" @click="downloadAll">{{$t("home.download")}}</button> -->
    <button class="cgss-btn cgss-btn-ok pull-right margin-left-10" @click="query">{{$t("home.search")}}</button>
  </div>
  <div class="margin-top-10 clearfix live-middle">
    <div class="black-bg live-result absolute-left">
      <ul>
        <li :class="{active:activeAudio.fileName === i.fileName}" v-for="i in bgmManifest" :key="i.hash" v-text="i.fileName" @click="selectAudio(i)"></li>
      </ul>
    </div>
    <div class="black-bg live-result absolute-right">
      <ul v-if="allLive">
        <li :class="{active:activeAudio.fileName === i.fileName}" v-for="i in liveManifest" :key="i.hash" v-text="i.fileName" @click="selectAudio(i)"></li>
      </ul>
      <ul v-else>
        <li :class="{active:activeAudio.fileName === i.fileName}" v-for="i in liveQueryList" :key="i.hash" v-text="i.fileName" @click="selectAudio(i)"></li>
      </ul>
    </div>
  </div>
  
  <div class="margin-top-20 clearfix live-bottom">
    <TaskLoading :total-loading="total" :current-loading="current" :text="text" :single="true" class="absolute-left" :color="'live'"/>
    <div class="gray-bg absolute-right flex-center timebar">
      <p>{{Math.floor(currentTime) | time}} / {{Math.floor(duration) | time}}</p>
      <input type="range" ref="playProg" :max="duration" min="0" :value="currentTime" @input="oninput()" :style="{ 'background-size': 100 * (currentTime / duration) + '% 100%' }">
    </div>
  </div>
</div>
</template>

<script lang="ts" src="../../ts/renderer/mishiro-live.ts">
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
  margin: 12px 0;
  width: calc(100% - 535px);
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
  margin-top: 10px;
  height: 5px;
  -webkit-appearance: none;
  background-color: #aaa;
  border-radius: 5px;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1'><rect width='100%' height='100%' style='fill:rgb(64,208,34)' /></svg>");
  background-repeat: no-repeat;
  background-size: 0% 100%;
  cursor: pointer;
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
  cursor: default;
  -webkit-box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.4);
}
/*input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  background-color: #aaa;
  border-radius: 4px;
  cursor: pointer;
}*/
</style>
