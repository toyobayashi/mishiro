<template>
<div style="position: absolute;width: 100%;height: 100%;">
  <transition name="fade" @after-leave="afterEnter">
    <entry v-if="!isEntered" @enter="isEntered = !isEntered"></entry>
  </transition>
  <transition name="fade">
    <update v-if="!isReady" @ready="isReady = !isReady" v-model="appData"></update>
  </transition>
  <background></background>
  <div id="mainBlock" v-show="show">
    <home v-show="currentBlock === 'home'"></home>
    <idol v-show="currentBlock === 'idol'" :master="appData.master"></idol>
    <live v-show="currentBlock === 'live'" :master="appData.master"></live>
    <gacha v-show="currentBlock === 'gacha'" :master="appData.master"></gacha>
    <menyuu v-show="currentBlock === 'menu'" @checking="checking = true" @checked="checking = false" :resVer="appData.resVer"></menyuu>
    <hide-button @toggle="showBackground"></hide-button>
    <version :resVer="appData.resVer"></version>
    <player :master="appData.master"></player>
    <small-tab :tab="i18nTabs" v-model="currentLanguage" id="i18nTab" @tabClicked="changeLanguage"></small-tab>
    <nav-bar :current-block="currentBlock" @changeBlock="changeBlock"></nav-bar>
  </div>
  <calculator :master="appData.master" :time="time"></calculator>
  <version-check></version-check>
  <about></about>
  <gacha-information :master="appData.master"></gacha-information>
  <gacha-history></gacha-history>
  <gacha-card :master="appData.master"></gacha-card>
  <setting :master="appData.master" :latestResVer="appData.resVer" v-model="currentLanguage"></setting>
  <alert></alert>
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

import player from './component/player.vue'
import background from './component/background.vue'
import smallTab from './component/smallTab.vue'
import hideButton from './component/hideButton.vue'
import navBar from './component/navBar.vue'
import version from './component/version.vue'

import alert from './modal/alert.vue'
import gachaHistory from './modal/gachaHistory.vue'
import gachaCard from './modal/gachaCard.vue'
import gachaInformation from './modal/gachaInformation.vue'
import about from './modal/about.vue'
import setting from './modal/setting.vue'
import versionCheck from './modal/versionCheck.vue'
import calculator from './modal/calculator.vue'

export default {
  components: {
    entry,
    player,
    update,
    background,
    smallTab,
    hideButton,
    navBar,
    version,
    home,
    idol,
    live,
    gacha,
    menyuu: menu,
    alert,
    gachaHistory,
    gachaCard,
    gachaInformation,
    about,
    versionCheck,
    setting,
    calculator
  },
  data () {
    return {
      isEntered: false,
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