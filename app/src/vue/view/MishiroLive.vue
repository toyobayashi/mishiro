<template>
<div class="main-block-style">
  <div class="clearfix">
    <TabSmall class="audio-type" :tab="audioTypeTabs" :noTranslation="true" v-model="currentAudioType" @tabClicked="onAudioTypeChange" />
    <InputText class="live-query" v-model="queryString" :placeholder="$t('live.input')"/>
    <button class="cgss-btn-lg cgss-btn-lg-star pull-right margin-left-10" @click="opendir">{{$t("home.opendir")}}</button>
    <!-- <button class="cgss-btn cgss-btn-star pull-right margin-left-10" @click="startGame">{{$t("live.live")}}</button> -->
    <button class="cgss-btn cgss-btn-default pull-right margin-left-10" @click="stopDownload" v-if="audioDownloading">{{$t("home.stop")}}</button>
    <button class="cgss-btn cgss-btn-star pull-right margin-left-10" :disabled="audioExporting" @click="downloadSelectedItem" v-else>{{$t("home.download")}}</button>
    <button class="cgss-btn cgss-btn-star pull-right margin-left-10" :disabled="audioExporting || audioDownloading" @click="exportSelectedItem">{{$t("live.export")}}</button>
    <button class="cgss-btn cgss-btn-ok pull-right margin-left-10" @click="query(false)">{{$t("home.search")}}</button>
  </div>
  <div class="margin-top-10 clearfix live-middle">
    <div class="black-bg live-result absolute-left" ref="audioList">
      <ul>
        <li
          class="audio-item"
          :class="{ active: i._active }"
          v-for="i in audioListData"
          :key="i.hash"
          @click="selectAudioNew(i)"
        >
          <div class="title" :title="i.fileName">{{i.fileName}}</div>
          <div class="play" v-if="i._canplay" @click.stop="selectAudio(i)">PLAY</div>
        </li>
      </ul>
    </div>
    <div class="black-bg absolute-right audio-info">
      <img :src="jacketSrc" />
      <pre class="precode">{{formatJson(activeAudio)}}</pre>
    </div>
  </div>

  <div class="margin-top-20 clearfix live-bottom">
    <TaskLoading :total-loading="total" :current-loading="current" :text="text" :single="true" class="absolute-left" :color="'live'"/>
    <div class="gray-bg absolute-right timebar">
      <div class="display-prog-wrap">
        <input class="volume-input" type="range" ref="playVolume" max="100" min="0" :value="playVolume" @input="onVolumeChange" :style="{ 'background-size': playVolume + '% 100%' }">
        <input class="range-input" type="range" ref="playProg" :max="duration" min="0" :value="currentTime" @input="oninput($event.target)" :style="{ 'background-size': 100 * (currentTime / duration) + '% 100%' }">
        <span class="left-time">{{Math.floor(currentTime) | time}} / {{Math.floor(duration) | time}}</span>
        <button v-if="activeAudio && activeAudio.score" class="scorebtn" @click="startScore">{{$t('live.score')}}</button>
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
.audio-type {
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
}
.live-query{
  margin: 12px 0;
  width: calc(100% - 900px);
}
.precode {
  font-family: Consolas;
  width: 100%;
}
.audio-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.audio-item {
  display: flex;
  align-items: center;
}
.audio-item .title {
  flex: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.audio-item .play {
  cursor: pointer;
  color: #333 !important;
  font-family: 'CGSS-B';
  box-sizing: border-box;
  /* width: 30px; */
  width: 50px;
  height: 30px;
  background: -webkit-linear-gradient(225deg, #f0f0f0, #d0d0d0, #c0c0c0);
  border: 2px solid #000000;
  border-bottom: 4px solid #000000;
  border-radius: 5px;
  display: inline-block;
  position: relative;
}
.audio-item .play:active {
  height: 28px;
  top: 2px;
  border-bottom: 2px solid #000000;
  background: -webkit-linear-gradient(225deg, #f0f0f0, #d0d0d0, #c0c0c0);
}
.display-prog-wrap {
  display: flex;
  width: 100%;
  align-items: center;
}
.display-prog-wrap .volume-input {
  flex: 1;
  margin-right: 12px;
}
.display-prog-wrap .range-input {
  flex: 3;
}
.display-prog-wrap .left-time {
  width: 120px;
  margin-left: 10px;
}
.display-prog-wrap .scorebtn {
  cursor: pointer;
  font-family: 'CGSS-B';
  box-sizing: border-box;
  /* width: 30px; */
  width: 60px;
  height: 30px;
  background: -webkit-linear-gradient(225deg, #f0f0f0, #d0d0d0, #c0c0c0);
  border: 2px solid #000000;
  border-bottom: 4px solid #000000;
  border-radius: 5px;
  display: inline-block;
  position: relative;
}
.display-prog-wrap .scorebtn:active {
  height: 28px;
  top: 2px;
  border-bottom: 2px solid #000000;
  background: -webkit-linear-gradient(225deg, #f0f0f0, #d0d0d0, #c0c0c0);
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
  color: #333 !important;
  text-align: left;
}
.live-result>ul>li.active{
  background: linear-gradient(180deg,#902070,#e070d0);
  color: #fff !important;
}
</style>
