<template>
<div class="bgm-select-bar clearfix">
  <button @click.stop="selectBgm()">
    <span :title="currentPlayingDisplay">{{currentPlayingDisplay}}</span>
  </button>
  <button @click.stop="pauseButton()" id="pauseBtn">
    <span>{{ isPlaying ? $t('home.pause') : $t('home.play') }}</span>
  </button>
  <ul class="gray-bg" v-show="isShow">
    <li v-for="bgm in bgmList"
        :key="bgm.src"
        :id="bgm.id"
        @click="play(bgm)">
        <span :title="bgm.displayName" v-text="bgm.displayName"
              :class="{ theme: bgm.src === playing.src }"></span>
    </li>
  </ul>
</div>
</template>

<script lang="ts" src="../../ts/renderer/the-player.ts">
</script>

<style>
.bgm-select-bar{
  width: 279px;
  font-family: 'CGSS-B';
  position: absolute;
  top: 0;
  left: calc(50% - 140px);
}
.bgm-select-bar>button{
  font-family: 'CGSS-B';
  font-size: 15px;
  cursor: pointer;
  height: 30px;
  background-image: url("../../asset/img.asar/bar_select.png");
}
.bgm-select-bar>button>span{
  display: inline-block;
  position: relative;
  bottom: 2px;
  height: 30px;
  overflow: hidden;
}
.bgm-select-bar>button:nth-child(1){
  float: left;
  width: 192px;
  position: relative;
  background-position: -384px -30px;
}
.bgm-select-bar>button:nth-child(1) > span {
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.bgm-select-bar>button:nth-child(2){
  color: #fff;
  float: left;
  width: 87px;
  background-position: -576px -30px;
}
.bgm-select-bar>button:nth-child(1):active{
  background-position: -384px 0;
  padding-top: 3px;
}
.bgm-select-bar>button:nth-child(2):active{
  background-position: -576px 0;
  padding-top: 3px;
}
.bgm-select-bar>ul{
  float: left;
  list-style: none;
  width: 192px;
  font-size: 14px;
  padding: 0;
}
.bgm-select-bar>ul>li{
  cursor: pointer;
  position: relative;
  height: 28px;
}
.bgm-select-bar>ul>li:first-child{
  border-radius: 8px 8px 0 0;
}
.bgm-select-bar>ul>li:last-child{
  border-radius: 0 0 8px 8px;
}
.bgm-select-bar>ul>li:hover{
  background-color: #999;
}
.bgm-select-bar>ul>li>span{
  display: inline-block;
  position: relative;
  width: 100%;
  height: 28px;
  line-height: 28px;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 5px;
}
</style>
