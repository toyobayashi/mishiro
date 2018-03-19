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
  <ModalGachaInformation :master="appData.master"/>
  <ModalGachaHistory/>
  <ModalGachaCard :master="appData.master"/>
  <ModalOption :master="appData.master" :latestResVer="appData.latestResVer" v-model="currentLanguage"/>
  <ModalAlert/>
  <img v-show="checking" :src="'./img/img.asar/spinner.gif'" class="spinner" />
</div>
</template>

<script>
import MishiroEntry from './view/MishiroEntry.vue'
import MishiroUpdate from './view/MishiroUpdate.vue'
import MishiroHome from './view/MishiroHome.vue'
import MishiroIdol from './view/MishiroIdol.vue'
import MishiroLive from './view/MishiroLive.vue'
import MishiroGacha from './view/MishiroGacha.vue'
import MishiroMenu from './view/MishiroMenu.vue'

import ThePlayer from './component/ThePlayer.vue'
import TheBackground from './component/TheBackground.vue'
import TabSmall from './component/TabSmall.vue'
import TheToggleButton from './component/TheToggleButton.vue'
import TheNavigationBar from './component/TheNavigationBar.vue'
import TheVersion from './component/TheVersion.vue'

import ModalAlert from './modal/ModalAlert.vue'
import ModalGachaHistory from './modal/ModalGachaHistory.vue'
import ModalGachaCard from './modal/ModalGachaCard.vue'
import ModalGachaInformation from './modal/ModalGachaInformation.vue'
import ModalAbout from './modal/ModalAbout.vue'
import ModalOption from './modal/ModalOption.vue'
import ModalVersion from './modal/ModalVersion.vue'
import ModalCalculator from './modal/ModalCalculator.vue'
import ModalLiveDifficulty from './modal/ModalLiveDifficulty.vue'

export default {
  components: {
    MishiroEntry,
    ThePlayer,
    MishiroUpdate,
    TheBackground,
    TabSmall,
    TheToggleButton,
    TheNavigationBar,
    TheVersion,
    MishiroHome,
    MishiroIdol,
    MishiroLive,
    MishiroGacha,
    MishiroMenu,
    ModalAlert,
    ModalGachaHistory,
    ModalGachaCard,
    ModalGachaInformation,
    ModalAbout,
    ModalVersion,
    ModalOption,
    ModalCalculator,
    ModalLiveDifficulty
  },
  data () {
    return {
      isEntered: false,
      isTouched: false,
      isReady: false,
      show: true,
      currentBlock: 'home',
      checking: false,
      currentLanguage: 'i18n.chinese',
      i18nTabs: {
        zh: 'i18n.chinese',
        ja: 'i18n.japanese'
      },
      appData: {
        resVer: 'Unknown',
        latestResVer: 'Unknown',
        master: {}
      },
      time: new Date().getTime()
    }
  },
  methods: {
    enter () {
      this.isEntered = true
    },
    changeLanguage (language) {
      switch (language) {
        case 'i18n.japanese': this._i18n._vm.locale = 'ja'; break
        case 'i18n.chinese': this._i18n._vm.locale = 'zh'; break
      }
      // this.$el.parentNode.parentNode.getElementsByTagName("title")[0].innerHTML = this.$t("title");
    },
    showBackground () {
      const cb = () => {
        this.show = !this.show
        document.removeEventListener('click', cb, false)
      }
      this.show = !this.show
      setTimeout(() => {
        if (!this.show) {
          document.addEventListener('click', cb, false)
        }
      }, 0)
    },
    afterEnter () {
      // console.log("[event] enter");
      this.event.$emit('enter')
    },
    changeBlock (block) {
      this.currentBlock = block
      this.event.$emit('changeBgm', block)
    }
  },
  mounted () {
    this.$nextTick(() => {
      setInterval(() => {
        this.time = new Date().getTime()
      }, 1000)
      document.addEventListener('keyup', (e) => {
        switch (e.keyCode) {
          case 13:
            this.event.$emit('enterKey', this.currentBlock)
            break
          case 27:
            this.event.$emit('escKey')
            break
          default:
            break
        }
      }, false)
    })
  }
}
</script>

<style src="../css/style.css"></style>