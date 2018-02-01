import modalMixin from './modalMixin.js'
import progressBar from '../../template/component/progressBar.vue'
import smallTab from '../../template/component/smallTab.vue'
import radio from '../../template/component/radio.vue'
import inputText from '../../template/component/inputText.vue'
import privateStatus from './calculatorData.js'
import ataponCal from './calculatorAtapon.js'
import caravanCal from './calculatorCaravan.js'
import medleyCal from './calculatorMedley.js'
import tourCal from './calculatorTour.js'
import { ipcRenderer } from 'electron'

export default {
  mixins: [modalMixin],
  components: {
    progressBar,
    smallTab,
    radio,
    inputText
  },
  props: {
    master: {
      type: Object,
      default: {}
    },
    time: {
      type: Number,
      default: new Date().getTime()
    }
  },
  computed: {
    eventData () {
      return this.master.eventData/*  ? this.master.eventData : {} */
    },
    userLevel () {
      return this.master.userLevel
    },
    eventTimeTotal () {
      if (!this.eventData) return 1
      return new Date(this.eventData.event_end).getTime() - new Date(this.eventData.event_start).getTime()
    },
    eventTimeGone () {
      if (!this.eventData) return 0
      return this.time - (new Date(this.eventData.event_start).getTime() - this.master.timeOffset)
    },
    eventTimeLeft () {
      return this.eventTimeTotal - this.eventTimeGone > 0 ? this.eventTimeTotal - this.eventTimeGone : 0
    },
    eventTimePercent () {
      return this.eventTimeGone / this.eventTimeTotal > 1 ? 100 : 100 * this.eventTimeGone / this.eventTimeTotal
    },
    maxStamina () {
      if (!this.publicStatus.plv || !this.userLevel) return 0
      return this.userLevel.filter((level) => level.level == this.publicStatus.plv)[0].stamina
    },
    maxExp () {
      if (!this.publicStatus.plv || !this.userLevel || this.publicStatus.plv == 300) return Infinity
      return this.userLevel.filter((level) => level.level == this.publicStatus.plv)[0].exp
    },
    staminaPercent () {
      if (this.stamina && this.maxStamina) return 100 * this.stamina / (this.maxStamina * this.staminaSpeed)
      return 0
    },
    staminaTimeLeft () {
      if (this.stamina && this.maxStamina) return this.timeFormate(1000 * (this.maxStamina * this.staminaSpeed - this.stamina))
      return '00:00'
    }
  },
  watch: {
    eventData (v) {
      if (v.type === 6) this.currentEventTab = 'ATAPON'
      else this.currentEventTab = this.eventType[v.type]
    }
  },
  data () {
    return {
      modalWidth: '920px',
      isCounting: false, // 是否正在进行体力计时
      currentEventTab: 'ATAPON', // 当前活动计算板块
      stamina: 0, // 已恢复的stamina，以秒记
      staminaSpeed: 300, // 恢复速度，以秒记
      staminaTimer: 0, // 计时器开关
      eventType: {
        '1': 'ATAPON',
        '2': 'CARAVAN',
        '3': 'MEDLEY',
        '5': 'TOUR'
      },
      publicStatus: {
        plv: '1',
        stamina: '0',
        exp: '0'
      },
      privateStatus
    }
  },
  methods: {
    toggle (eventType) {
      // console.log(eventType)
      this.currentEventTab = eventType
    },
    stopCount () {
      this.playSe(this.cancelSe)
      this.isCounting = false
      clearInterval(this.staminaTimer)
      this.stamina = 0
    },
    startCount () {
      this.playSe(this.enterSe)
      if (!isNaN(this.publicStatus.stamina) && this.publicStatus.stamina < this.maxStamina * this.staminaSpeed) {
        this.stamina = this.publicStatus.stamina * this.staminaSpeed
        if (this.stamina >= this.maxStamina * this.staminaSpeed) return
        this.isCounting = true
        this.staminaTimer = setInterval(() => {
          this.stamina++
          this.publicStatus.stamina = parseInt(this.stamina / this.staminaSpeed)
          if (this.stamina >= this.maxStamina * this.staminaSpeed) {
            clearInterval(this.staminaTimer)
            this.isCounting = false
            ipcRenderer.send('flash')
            this.event.$emit('alert', this.$t('home.msg'), this.$t('home.stmnFull'))
          }
        }, 1000)
      }
    },
    calculate () {
      this.playSe(this.enterSe)
      if (this.currentEventTab === 'ATAPON') {
        ataponCal.call(this)
      } else if (this.currentEventTab === 'TOUR') {
        tourCal.call(this)
      } else if (this.currentEventTab === 'MEDLEY') {
        medleyCal.call(this)
      } else if (this.currentEventTab === 'CARAVAN') {
        caravanCal.call(this)
      } else {
        this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.hope'))
      }
    },
    clear () {
      this.playSe(this.cancelSe)
      if (this.currentEventTab === 'ATAPON') {
        // clearInterval(this.privateStatus['1'].timer)
        for (let key in this.privateStatus['1'].output) {
          if (key === 'gameTime') this.privateStatus['1'].output[key] = '00:00'
          else this.privateStatus['1'].output[key] = 0
        }
      } else if (this.currentEventTab === 'TOUR') {
        for (let key in this.privateStatus['5'].output) {
          if (key === 'gameTime') this.privateStatus['5'].output[key] = '00:00'
          else this.privateStatus['5'].output[key] = 0
        }
      } else if (this.currentEventTab === 'MEDLEY') {
        for (let key in this.privateStatus['3'].output) {
          if (key === 'gameTime') this.privateStatus['3'].output[key] = '00:00'
          else this.privateStatus['3'].output[key] = 0
        }
      } else if (this.currentEventTab === 'CARAVAN') {
        for (let key in this.privateStatus['2'].output) {
          if (key === 'gameTime') this.privateStatus['2'].output[key] = '00:00'
          else if (key === 'extraRewardOdds') this.privateStatus['2'].output[key] = '0/0/0/0/0'
          else if (key === 'cardRewardOdds') this.privateStatus['2'].output[key] = '0.00/0.00'
          else this.privateStatus['2'].output[key] = 0
        }
      } else {
        this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.hope'))
      }
    },
    timeFormate (t) {
      let day = Math.floor(t / 1000 / 60 / 60 / 24)
      let hour = Math.floor(t / 1000 / 60 / 60 % 24)
      let minute = Math.floor(t / 1000 / 60 % 60)
      let second = Math.floor(t / 1000 % 60)
      return `${day ? day + '日' : ''}${day ? (hour >= 10 ? hour + ':' : ('0' + hour + ':')) : (hour ? (hour >= 10 ? hour + ':' : ('0' + hour + ':')) : '')}${minute >= 10 ? minute : '0' + minute}:${second >= 10 ? second : '0' + second}`
    },
    getExp (plv) {
      if (plv >= 300) return Infinity
      return this.userLevel.filter((level) => level.level == plv)[0].exp
    },
    getMaxStamina (plv) {
      return this.userLevel.filter((level) => level.level == plv)[0].stamina
    },
    getLevelUpTimes (liveTimes, expPerTime, currentExp) {
      let levelUp = 0
      let gotExp = liveTimes * expPerTime + Number(currentExp)
      let tempLevel = this.publicStatus.plv
      // console.log('gotExp = ' + (liveTimes * expPerTime))
      while (gotExp >= this.getExp(tempLevel)) {
        gotExp = gotExp - this.getExp(tempLevel)
        tempLevel++
        levelUp++
      }
      return levelUp
    },
    ptCount (times, use, levelUp, typeCode, loginStamina) {
      // console.log(times, use, levelUp, typeCode, loginStamina)
      let levelStamina = 0
      let tempLevel = Number(this.publicStatus.plv)
      let speed = this.staminaSpeed
      let currentStaminaSeconds = this.stamina

      let stmn = 0
      let seconds = 0
      for (let i = 0; i < levelUp; i++) {
        tempLevel++
        levelStamina = levelStamina + this.getMaxStamina(tempLevel)
      }
      if (loginStamina) {
        stmn = Math.ceil((times * use * speed - currentStaminaSeconds) / speed) - levelStamina - loginStamina
        seconds = times * use * speed - currentStaminaSeconds - levelStamina * speed - loginStamina * speed
      } else {
        stmn = Math.ceil((times * use * speed - currentStaminaSeconds) / speed) - levelStamina
        seconds = times * use * speed - currentStaminaSeconds - levelStamina * speed
      }

      this.privateStatus[typeCode].output.requireStamina = stmn > 0 ? stmn : 0
      this.privateStatus[typeCode].output.gameTime = this.timeFormate(seconds > 0 ? seconds * 1000 : 0)

      let extraStamina = 0
      if (seconds > this.eventTimeLeft / 1000) {
        extraStamina = Math.ceil((seconds - this.eventTimeLeft / 1000) / speed)
      }
      this.privateStatus[typeCode].output.extraStamina = extraStamina
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.event.$on('openCal', () => {
        this.show = true
        this.visible = true
      })
    })
  }
}
