<template>
<div class="main-block-style">
  <div class="clearfix">
    <InputText class="live-query" v-model="queryString" :placeholder="$t('live.input')"/>
    <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-10" @click="opendir">{{$t("home.opendir")}}</button>
    <!-- <button class="cgss-btn cgss-btn-star pull-right margin-left-10" @click="startGame">{{$t("live.live")}}</button> -->
    <button class="cgss-btn cgss-btn-star pull-right margin-left-10" @click="startScore">{{$t("live.score")}}</button>
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
    <div class="gray-bg absolute-right timebar">
      <div style="width: 100%;">
        <input type="range" ref="playProg" :max="duration" min="0" :value="currentTime" @input="oninput($event.target)" style="width: calc(100% - 130px);" :style="{ 'background-size': 100 * (currentTime / duration) + '% 100%' }">
        <span style="display: inline-block; margin-left: 10px;">{{Math.floor(currentTime) | time}} / {{Math.floor(duration) | time}}</span>
      </div>
      <div class="lyrics" v-if="allLyrics.length">
        <span @click="openLyrics" :style="{ color: lyrics.indexOf(l) === 0 ? '#902070' : '#000', 'font-size': lyrics.indexOf(l) === 0 ? '18px' : void 0 }" v-for="l in lyrics" :key="l.time">{{l.lyrics}}</span>
      </div>
      <div class="lyrics" style="justify-content: center;" v-else>
        <span style="font-size: 25px;">{{$t('live.noLyrics')}}</span>
      </div>
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
.timebar .lyrics {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 65px;
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
  width: calc(100% - 530px);
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
</style>
