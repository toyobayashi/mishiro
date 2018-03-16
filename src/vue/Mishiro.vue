<template>
<div style="position: absolute;width: 100%;height: 100%;">
  <transition name="fade" @after-leave="afterEnter">
    <entry v-if="!isEntered" @enter="isEntered = !isEntered" @touch="isTouched = true"></entry>
  </transition>
  <transition name="fade">
    <update v-if="!isReady" @ready="isReady = !isReady" v-model="appData" :is-touched="isTouched"></update>
  </transition>
  <TheBackground/>
  <div id="mainBlock" v-show="show">
    <home v-show="currentBlock === 'home'"></home>
    <idol v-show="currentBlock === 'idol'" :master="appData.master"></idol>
    <live v-show="currentBlock === 'live'" :master="appData.master"></live>
    <gacha v-show="currentBlock === 'gacha'" :master="appData.master"></gacha>
    <menyuu v-show="currentBlock === 'menu'" @checking="checking = true" @checked="checking = false" :resVer="appData.resVer"></menyuu>
    <TheToggleButton @toggle="showBackground"/>
    <TheVersion :resVer="appData.resVer"/>
    <ThePlayer :master="appData.master"/>
    <small-tab :tab="i18nTabs" v-model="currentLanguage" id="i18nTab" @tabClicked="changeLanguage"></small-tab>
    <TheNavigationBar :current-block="currentBlock" @changeBlock="changeBlock"/>
  </div>
  <ModalCalculator :master="appData.master" :time="time"/>
  <ModalVersion/>
  <ModalAbout/>
  <ModalGachaInformation :master="appData.master"/>
  <ModalGachaHistory/>
  <ModalGachaCard :master="appData.master"/>
  <ModalOption :master="appData.master" :latestResVer="appData.latestResVer" v-model="currentLanguage"/>
  <ModalAlert/>
  <img v-show="checking" src="../res/img/spinner.gif" class="spinner" />
</div>
</template>

<script>
import entry from './view/entry.vue'
import update from './view/update.vue'
import home from './view/home.vue'
import idol from './view/idol.vue'
import live from './view/live.vue'
import gacha from './view/gacha.vue'
import menu from './view/menu.vue'

import ThePlayer from './component/ThePlayer.vue'
import TheBackground from './component/TheBackground.vue'
import smallTab from './component/smallTab.vue'
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

export default {
  components: {
    entry,
    ThePlayer,
    update,
    TheBackground,
    smallTab,
    TheToggleButton,
    TheNavigationBar,
    TheVersion,
    home,
    idol,
    live,
    gacha,
    menyuu: menu,
    ModalAlert,
    ModalGachaHistory,
    ModalGachaCard,
    ModalGachaInformation,
    ModalAbout,
    ModalVersion,
    ModalOption,
    ModalCalculator
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