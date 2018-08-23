import { Vue, Component } from 'vue-property-decorator'

import MishiroEntry from '../../vue/view/MishiroEntry.vue'
import MishiroUpdate from '../../vue/view/MishiroUpdate.vue'
import MishiroHome from '../../vue/view/MishiroHome.vue'
import MishiroIdol from '../../vue/view/MishiroIdol.vue'
import MishiroLive from '../../vue/view/MishiroLive.vue'
import MishiroGacha from '../../vue/view/MishiroGacha.vue'
import MishiroMenu from '../../vue/view/MishiroMenu.vue'

import ThePlayer from '../../vue/component/ThePlayer.vue'
import TheBackground from '../../vue/component/TheBackground.vue'
import TabSmall from '../../vue/component/TabSmall.vue'
import TheToggleButton from '../../vue/component/TheToggleButton.vue'
import TheFooter from '../../vue/component/TheFooter.vue'
import TheVersion from '../../vue/component/TheVersion.vue'

import ModalAlert from '../../vue/modal/ModalAlert.vue'
import ModalGachaHistory from '../../vue/modal/ModalGachaHistory.vue'
import ModalGachaCard from '../../vue/modal/ModalGachaCard.vue'
import ModalGachaInformation from '../../vue/modal/ModalGachaInformation.vue'
import ModalAbout from '../../vue/modal/ModalAbout.vue'
import ModalOption from '../../vue/modal/ModalOption.vue'
import ModalVersion from '../../vue/modal/ModalVersion.vue'
import ModalCalculator from '../../vue/modal/ModalCalculator.vue'
import ModalLiveDifficulty from '../../vue/modal/ModalLiveDifficulty.vue'
import ModalLiveResult from '../../vue/modal/ModalLiveResult.vue'

const i18nTabs: any = {
  zh: 'i18n.chinese',
  ja: 'i18n.japanese',
  en: 'i18n.english'
}

@Component({
  components: {
    MishiroEntry,
    ThePlayer,
    MishiroUpdate,
    TheBackground,
    TabSmall,
    TheToggleButton,
    TheFooter,
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
    ModalLiveDifficulty,
    ModalLiveResult
  }
})
export default class extends Vue {
  isEntered: boolean = process.env.NODE_ENV !== 'production'
  isTouched: boolean = process.env.NODE_ENV !== 'production'
  isReady: boolean = false
  show: boolean = true
  currentBlock: string = 'home'
  checking: boolean = false
  currentLanguage: boolean = i18nTabs[this.configurer.getConfig().language as string]
  i18nTabs = i18nTabs
  appData: any = {
    resVer: 'Unknown',
    latestResVer: 'Unknown',
    master: {}
  }
  time: number = new Date().getTime()

  enter () {
    this.isEntered = true
  }
  changeLanguage (language: string) {
    switch (language) {
      case 'i18n.japanese': this._i18n._vm.locale = 'ja'; break
      case 'i18n.chinese': this._i18n._vm.locale = 'zh'; break
      case 'i18n.english': this._i18n._vm.locale = 'en'; break
    }
    // this.$el.parentNode.parentNode.getElementsByTagName("title")[0].innerHTML = this.$t("title");
  }
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
  }
  afterEnter (devResVer?: number) {
    this.event.$emit('enter', devResVer)
  }

  mounted () {
    this.$nextTick(() => {
      if (process.env.NODE_ENV !== 'production') this.afterEnter(10043310)
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
