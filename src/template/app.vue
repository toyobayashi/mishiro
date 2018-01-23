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
    <home v-show="currentBlock === 'home'" :manifest="appData.manifest"></home>
    <idol v-show="currentBlock === 'idol'" :master="appData.master"></idol>
    <live v-show="currentBlock === 'live'" :master="appData.master"></live>
    <gacha v-show="currentBlock === 'gacha'" :master="appData.master"></gacha>
    <menyuu v-show="currentBlock === 'menu'" @checking="checking = true" @checked="checking = false" :resVer="appData.resVer"></menyuu>
    <hide-button @toggle="showBackground"></hide-button>
    <version :resVer="appData.resVer"></version>
    <player :master="appData.master"></player>
    <small-tab :tab="i18nTabs" :default="_i18n._vm.locale" id="i18nTab" @tabClicked="changeLanguage"></small-tab>
    <nav-bar :current-block="currentBlock" @changeBlock="changeBlock"></nav-bar>
  </div>
  <version-check></version-check>
  <about></about>
  <gacha-information :master="appData.master"></gacha-information>
  <gacha-history></gacha-history>
  <gacha-card :master="appData.master"></gacha-card>
  <setting :master="appData.master" :latestResVer="appData.resVer"></setting>
  <alert></alert>
  <img v-show="checking" src="../res/img/spinner.gif" class="spinner" />
</div>
</template>

<script>
import entry from './entry.vue'
import player from './player.vue'
import update from './update.vue'
import background from './background.vue'
import smallTab from './smallTab.vue'
import hideButton from './hideButton.vue'
import navBar from './navBar.vue'
import version from './version.vue'
import home from './home.vue'
import idol from './idol.vue'
import live from './live.vue'
import gacha from './gacha.vue'
import menu from './menu.vue'
import alert from './alert.vue'
import gachaHistory from './gachaHistory.vue'
import gachaCard from './gachaCard.vue'
import gachaInformation from './gachaInformation.vue'
import about from './about.vue'
import setting from './setting.vue'
import versionCheck from './versionCheck.vue'
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
    setting
  },
  data () {
    return {
      isEntered: false,
      isReady: false,
      show: true,
      currentBlock: 'home',
      checking: false,
      i18nTabs: {
        zh: 'i18n.chinese',
        ja: 'i18n.japanese'
      },
      appData: {
        resVer: 'Unknown',
        manifest: [],
        master: {}
      }
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