<template>
<div style="position: absolute;width: 100%;height: 100%;">
  <transition name="fade" @after-leave="afterEnter(null)">
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
    <TheFooter v-model="currentBlock"/>
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
  <img v-if="checking" :src="'./img.asar/spinner.gif'" class="spinner" />
</div>
</template>

<script lang="ts" src="../ts/renderer/mishiro.ts">
</script>
