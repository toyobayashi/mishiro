<template>
<div style="position: absolute;width: 100%;height: 100%;">
  <transition name="fade" @after-leave="afterEnter">
    <MishiroEntry v-if="!isEntered" @enter="isEntered = !isEntered" @touch="isTouched = true"/>
  </transition>
  <transition name="fade">
    <MishiroUpdate v-if="!isReady" @ready="isReady = !isReady" v-model="appData" :is-touched="isTouched"/>
  </transition>
  <TheBackground/>
  <div id="mainBlock" v-show="show">
    <MishiroHome v-show="currentBlock === 'home'"/>
    <MishiroIdol v-show="currentBlock === 'idol'" :master="appData.master"/>
    <MishiroLive v-show="currentBlock === 'live'" :master="appData.master"/>
    <MishiroGacha v-show="currentBlock === 'gacha'" :master="appData.master"/>
    <MishiroMenu v-show="currentBlock === 'menu'" @checking="checking = true" @checked="checking = false" :resVer="appData.resVer"/>
    <TheToggleButton @toggle="showBackground"/>
    <TheVersion :resVer="appData.resVer"/>
    <ThePlayer :master="appData.master"/>
    <TabSmall :tab="i18nTabs" v-model="currentLanguage" id="i18nTab" @tabClicked="changeLanguage"/>
    <TheNavigationBar :current-block="currentBlock" @changeBlock="changeBlock"/>
  </div>
  <ModalCalculator :master="appData.master" :time="time"/>
  <ModalVersion/>
  <ModalAbout/>
  <ModalLiveDifficulty/>
  <ModalLiveResult/>
  <ModalGachaInformation :master="appData.master"/>
  <ModalGachaHistory/>
  <ModalGachaCard :master="appData.master"/>
  <ModalOption :master="appData.master" :latestResVer="appData.latestResVer" v-model="currentLanguage"/>
  <ModalAlert/>
  <img v-show="checking" :src="'./img/img.asar/spinner.gif'" class="spinner" />
</div>
</template>

<script lang="ts" src="../ts/renderer/mishiro.ts">
</script>

<style>
*{
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}
body{
  overflow: hidden;
  font-size: 15px;
  user-select: none;
  cursor: default;
  font-family: "CGSS";
}
@font-face{
  font-family:'CGSS';
  src:url(./asset/font.asar/FRM.otf)
}
@font-face{
  font-family:'CGSS-B';
  src:url(./asset/font.asar/FRB.otf)
}
::-webkit-scrollbar{
  width:0;
}

.gray-bg{
  border: 2px solid #000;
  border-radius: 10px;
  background: linear-gradient(180deg, #f0f0f0, #d0d0d0);
  padding: 10px 10px;
}
.black-bg{
  border: 3px solid #202020;
  border-radius: 7px;
  background-color: rgba(32,32,32,0.8);
  padding: 10px 10px;
  color: #ffffff;
  overflow-y: auto;
}
.black-bg::-webkit-scrollbar-track, .modal-body::-webkit-scrollbar-track
{
  box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
  border-radius: 10px;
  background-color: #aaa;
}
.black-bg::-webkit-scrollbar, .modal-body::-webkit-scrollbar
{
  width: 8px;
  background-color: rgba(0,0,0,0);
}
.black-bg::-webkit-scrollbar-thumb, .modal-body::-webkit-scrollbar-thumb
{
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgba(0,0,0,.3);
  background-color: #555;
}
.white-bg{
  background-color: rgba(240,240,240,0.6);
  border-radius: 10px;
  padding: 5px;
  box-shadow:0 2px 1px rgba(144,144,144,0.5);
  font-family: "CGSS-B";
  font-size: 15px;
  color: #333;
}
.gray-area{
  overflow: auto;
  background-color: rgba(192,192,192,0.7);
  border: 1px solid rgb(128,128,128);
  border-radius: 10px;
  box-shadow: 0 2px 1px rgba(160,160,160,0.76) inset;
  padding: 10px;
}

button{
  outline: none !important;
  border:none;
  background-color: rgba(255,255,255,0);
}
ol,ul{
  margin: 0;
}
input{
  display: inline-block !important;
}
select{
  display: inline-block !important;
}
td, th{
  box-sizing: border-box !important;
}

.clearfix { 
  *zoom: 1; 
}
.clearfix:before, 
.clearfix:after { 
  display: table; 
  line-height: 0; 
  content: "";
  clear: both;
}

#i18nTab{
  position: absolute;
  top: 0;
  left: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .3s
}
.fade-enter, .fade-leave-to{
  opacity: 0
}

.scale-enter-active, .scale-leave-active {
  transition: transform .2s
}
.scale-enter, .scale-leave-to{
  transform: scale(0)
}

.cgss-btn{
  display: inline-block;
  white-space: nowrap;
  touch-action: manipulation;
  user-select: none;
  cursor: pointer;
  width: 152px;
  height: 64px;
  border: none;
  outline: none;
  background-image: url("./img/img.asar/button.png");
  background-color: rgba(255,255,255,0);
  font-family: "CGSS-B";
  font-size: 29px;
  padding-bottom: 10px;
  margin:0;
}
.cgss-btn:active{
  padding-bottom: 0;
}
.cgss-btn-ok{
  color:#fff;
  font-size: 28px;
  -webkit-text-stroke: 1px rgb(80,17,63);
  background-position: 0 -65px;
}
.cgss-btn-ok:active{
  background-position: 0 0;
}
.cgss-btn-default{
  color:#323232;
  background-position: -152px -65px;
}
.cgss-btn-default:active{
  background-position: -152px 0;
}
.cgss-btn-star{
  color:#323232;
  background-position: -304px -65px;
}
.cgss-btn-star:active{
  background-position: -304px 0;
}
.cgss-btn-lg{
  display: inline-block;
  white-space: nowrap;
  touch-action: manipulation;
  user-select: none;
  cursor: pointer;
  width: 194px;
  height: 64px;
  border: none;
  outline: none;
  background-image: url("./img/img.asar/button_large.png");
  background-color: rgba(255,255,255,0);
  font-family: "CGSS-B";
  font-size: 29px;
  padding-bottom: 10px;
  margin:0 0;
}
.cgss-btn-lg:active{
  padding-bottom: 0;
}
.cgss-btn-lg-ok{
  color:#fff;
  font-size: 28px;
  -webkit-text-stroke: 1px rgb(80,17,63);
  background-position: 0 -64px;
}
.cgss-btn-lg-ok:active{
  background-position: 0 0;
}
.cgss-btn-lg-default{
  color:#323232;
  background-position: -194px -64px;
}
.cgss-btn-lg-default:active{
  background-position: -194px 0;
}
.cgss-btn-lg-star{
  color:#323232;
  background-position: -388px -64px;
}
.cgss-btn-lg-star:active{
  background-position: -388px 0;
}
.cgss-btn-sm{
  display: inline-block;
  white-space: nowrap;
  touch-action: manipulation;
  user-select: none;
  cursor: pointer;
  width: 88px;
  height: 64px;
  border: none;
  outline: none;
  background-image: url("./img/img.asar/button_small.png");
  background-color: rgba(255,255,255,0);
  font-family: "CGSS-B";
  font-size: 25px;
  padding-bottom: 10px;
  margin:0;
}
.cgss-btn-sm:active{
  padding-bottom: 0;
}
.cgss-btn-sm-ok{
  color:#fff;
  font-size: 25px;
  -webkit-text-stroke: 1px rgb(80,17,63);
  background-position: 0 -64px;
}
.cgss-btn-sm-ok:active{
  background-position: 0 0;
}
.cgss-btn-sm-default{
  color:#323232;
  background-position: -88px -64px;
}
.cgss-btn-sm-default:active{
  background-position: -88px 0;
}
/* .cgss-btn-round{
  cursor: pointer;
  width: 56px;
  height: 56px;
  border: none;
  outline: none;
  background-color: rgba(255,255,255,0);
  background-image: url("../res/img/play.png");
  background-position: 0 0;
}
.cgss-btn-round-stop{
  background-position: 0 -57px;
}
.cgss-btn-download{
  display: inline-block;
  cursor: pointer;
  width: 56px;
  height: 56px;
  border: none;
  outline: none;
  background-color: rgba(255,255,255,0);
  background-image: url("../res/img/play.png");
  background-position: 0 -114px;
} */

.pull-left{
  float: left;
}
.pull-right{
  float: right;
}
.margin-right-20{
  margin-right: 20px;
}
.margin-left-10{
  margin-left: 10px;
}
.margin-top-10{
  margin-top: 10px;
}
.margin-top-20{
  margin-top: 20px;
}
.flex-center{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.flex-left-middle{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}
</style>
