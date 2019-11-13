import { Vue, Component } from 'vue-property-decorator'

// import MishiroEntry from '../../vue/view/MishiroEntry.vue'
import MishiroUpdate from '../../vue/view/MishiroUpdate.vue'
// import MishiroHome from '../../vue/view/MishiroHome.vue'
// import MishiroIdol from '../../vue/view/MishiroIdol.vue'
import MishiroLive from '../../vue/view/MishiroLive.vue'
// import MishiroGacha from '../../vue/view/MishiroGacha.vue'
// import MishiroMenu from '../../vue/view/MishiroMenu.vue'

// import ThePlayer from '../../vue/component/ThePlayer.vue'
import TheBackground from '../../vue/component/TheBackground.vue'
// import TheToggleButton from '../../vue/component/TheToggleButton.vue'
// import TheFooter from '../../vue/component/TheFooter.vue'
// import TheVersion from '../../vue/component/TheVersion.vue'
import TabSmall from '../../vue/component/TabSmall.vue'

// import ModalAlert from '../../vue/modal/ModalAlert.vue'
// import ModalGachaHistory from '../../vue/modal/ModalGachaHistory.vue'
// import ModalGachaCard from '../../vue/modal/ModalGachaCard.vue'
// import ModalGachaInformation from '../../vue/modal/ModalGachaInformation.vue'
// import ModalAbout from '../../vue/modal/ModalAbout.vue'
// import ModalOption from '../../vue/modal/ModalOption.vue'
// import ModalVersion from '../../vue/modal/ModalVersion.vue'
// import ModalCalculator from '../../vue/modal/ModalCalculator.vue'
// import ModalLiveDifficulty from '../../vue/modal/ModalLiveDifficulty.vue'
// import ModalScore from '../../vue/modal/ModalScore.vue'
// import ModalLiveResult from '../../vue/modal/ModalLiveResult.vue'

const i18nTabs: any = {
  zh: 'i18n.chinese',
  ja: 'i18n.japanese',
  en: 'i18n.english'
}

// const useResVer = window.preload.configurer.getConfig().latestResVer
const useResVer = undefined

const skip = false // process.env.NODE_ENV !== 'production'

@Component({
  components: {
    MishiroEntry: () => import(/* webpackChunkName: "mishiro-entry" */ '../../vue/view/MishiroEntry.vue'),
    MishiroUpdate,
    MishiroHome: () => import(/* webpackChunkName: "mishiro-home" */ '../../vue/view/MishiroHome.vue'),
    MishiroIdol: () => import(/* webpackChunkName: "mishiro-idol" */ '../../vue/view/MishiroIdol.vue'),
    MishiroLive,
    // MishiroGacha: () => import(/* webpackChunkName: "mishiro-gacha" */ '../../vue/view/MishiroGacha.vue'),
    MishiroCommu: () => import(/* webpackChunkName: "mishiro-commu" */ '../../vue/view/MishiroCommu.vue'),
    MishiroMenu: () => import(/* webpackChunkName: "mishiro-menu" */ '../../vue/view/MishiroMenu.vue'),

    ThePlayer: () => import(/* webpackChunkName: "the-player" */ '../../vue/component/ThePlayer.vue'),
    TheBackground,
    TheToggleButton: () => import(/* webpackChunkName: "the-toggle-button" */ '../../vue/component/TheToggleButton.vue'),
    TheFooter: () => import(/* webpackChunkName: "the-footer" */ '../../vue/component/TheFooter.vue'),
    TheVersion: () => import(/* webpackChunkName: "the-version" */ '../../vue/component/TheVersion.vue'),
    TabSmall,

    ModalAlert: () => import(/* webpackChunkName: "modal-alert" */ '../../vue/modal/ModalAlert.vue'),
    // ModalGachaHistory: () => import(/* webpackChunkName: "modal-gacha-history" */ '../../vue/modal/ModalGachaHistory.vue'),
    // ModalGachaCard: () => import(/* webpackChunkName: "modal-gacha-card" */ '../../vue/modal/ModalGachaCard.vue'),
    // ModalGachaInformation: () => import(/* webpackChunkName: "modal-gacha-information" */ '../../vue/modal/ModalGachaInformation.vue'),
    ModalAbout: () => import(/* webpackChunkName: "modal-about" */ '../../vue/modal/ModalAbout.vue'),
    ModalVersion: () => import(/* webpackChunkName: "modal-version" */ '../../vue/modal/ModalVersion.vue'),
    ModalOption: () => import(/* webpackChunkName: "modal-option" */ '../../vue/modal/ModalOption.vue'),
    ModalCalculator: () => import(/* webpackChunkName: "modal-calculator" */ '../../vue/modal/ModalCalculator.vue'),
    // ModalLiveDifficulty: () => import(/* webpackChunkName: "modal-live-difficulty" */ '../../vue/modal/ModalLiveDifficulty.vue'),
    ModalScore: () => import(/* webpackChunkName: "modal-score" */ '../../vue/modal/ModalScore.vue')
    // ModalLiveResult: () => import(/* webpackChunkName: "modal-live-result" */ '../../vue/modal/ModalLiveResult.vue')
  }
})
export default class extends Vue {
  isEntered: boolean = skip
  isTouched: boolean = skip
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

  enter (): void {
    this.isEntered = true
  }

  changeLanguage (language: string): void {
    switch (language) {
      case 'i18n.japanese': this._i18n._vm.locale = 'ja'; break
      case 'i18n.chinese': this._i18n._vm.locale = 'zh'; break
      case 'i18n.english': this._i18n._vm.locale = 'en'; break
    }
    // this.$el.parentNode.parentNode.getElementsByTagName("title")[0].innerHTML = this.$t("title");
  }

  showBackground (): void {
    const cb = (): void => {
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

  afterEnter (devResVer?: number): void {
    this.event.$emit('enter', devResVer)
  }

  mounted (): void {
    this.$nextTick(() => {
      if (skip) this.afterEnter(useResVer)
      setInterval(() => {
        this.time = new Date().getTime()
      }, 1000)
      document.addEventListener('keyup', (e) => {
        switch (e.key) {
          case 'Enter':
            this.event.$emit('enterKey', this.currentBlock)
            break
          case 'Escape':
            this.event.$emit('escKey')
            break
          default:
            break
        }
      }, false)
    })
  }
}
