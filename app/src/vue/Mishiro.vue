<template>
<div style="position: absolute;width: 100%;height: 100%;">
  <transition name="fade" @after-leave="afterEnter(null)">
    <MishiroEntry v-if="!isEntered" @enter="isEntered = !isEntered" @touch="isTouched = true"/>
  </transition>
  <transition name="fade">
    <MishiroUpdate v-if="!isReady" @ready="isReady = !isReady" :is-touched="isTouched"/>
  </transition>
  <TheBackground v-show="isReady"/>
  <div id="mainBlock" v-show="show && isReady">
    <MishiroHome v-show="currentBlock === 'home'" />
    <MishiroIdol v-show="currentBlock === 'idol'" />
    <MishiroLive v-show="currentBlock === 'live'" />
    <!-- <MishiroGacha v-show="currentBlock === 'gacha'" :master="appData.master"/> -->
    <MishiroCommu v-show="currentBlock === 'commu'" />
    <MishiroMenu v-show="currentBlock === 'menu'" @checking="checking = true" @checked="checking = false" />
    <TheToggleButton @toggle="showBackground"/>
    <TheVersion />
    <ThePlayer />
    <TabSmall :tab="i18nTabs" v-model="currentLanguage" id="i18nTab" @tabClicked="changeLanguage"/>
    <TheFooter v-model="currentBlock"/>
  </div>
  <ModalCalculator :time="time"/>
  <ModalVersion/>
  <ModalAbout/>
  <!-- <ModalLiveDifficulty/> -->
  <ModalScore/>
  <!-- <ModalLiveResult/> -->
  <!-- <ModalGachaInformation :master="appData.master"/> -->
  <!-- <ModalGachaHistory/> -->
  <!-- <ModalGachaCard :master="appData.master"/> -->
  <ModalOption v-model="currentLanguage"/>
  <ModalBatchError />
  <ModalAlert/>
  <img v-if="checking" :src="'../../asset/img.asar/spinner.gif'" class="spinner" />
</div>
</template>

<script lang="ts" src="../ts/renderer/mishiro.ts">
</script>
