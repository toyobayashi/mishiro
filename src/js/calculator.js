import modalMixin from './modalMixin.js'
import progressBar from '../template/component/progressBar.vue'
import smallTab from '../template/component/smallTab.vue'
import radio from '../template/component/radio.vue'
import inputText from '../template/component/inputText.vue'
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
      return this.eventTimeTotal - this.eventTimeGone
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
      console.log(v.type)
      if (v.type === 6) this.currentEventTab = 'ATAPON'
      else this.currentEventTab = this.eventType[v.type]
    }
  },
  data () {
    return {
      modalWidth: '900px',
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
      privateStatus: {
        '1': {
          input: {
            itemNumber: {
              type: 'text',
              model: ''
            },
            currentPt: {
              type: 'text',
              model: ''
            },
            targetPt: {
              type: 'text',
              model: ''
            },
            commonTimes: {
              type: 'radio',
              model: '1',
              option: [{
                id: 'act1',
                text: '1倍',
                value: '1'
              }, {
                id: 'act2',
                text: '2倍',
                value: '2'
              }]
            },
            commonDifficulty: {
              type: 'radio',
              model: '19 53 63',
              option: [
                {
                  id: 'acdD',
                  text: 'D',
                  value: '11 28 42'
                },
                {
                  id: 'acdR',
                  text: 'R',
                  value: '14 37 49'
                },
                {
                  id: 'acdP',
                  text: 'P',
                  value: '17 47 56'
                },
                {
                  id: 'acdM',
                  text: 'M',
                  value: '19 53 63'
                }
              ]
            },
            eventTimes: {
              type: 'radio',
              model: '1',
              option: [
                {
                  id: 'aet1',
                  text: '1倍',
                  value: '1'
                },
                {
                  id: 'aet2',
                  text: '2倍',
                  value: '2'
                },
                {
                  id: 'aet4',
                  text: '4倍',
                  value: '4'
                }
              ]
            },
            eventDifficulty: {
              type: 'radio',
              model: '150 320 63',
              option: [
                {
                  id: 'aedD',
                  text: 'D',
                  value: '75 130 42'
                },
                {
                  id: 'aedR',
                  text: 'R',
                  value: '90 170 49'
                },
                {
                  id: 'aedP',
                  text: 'P',
                  value: '120 240 56'
                },
                {
                  id: 'aedM',
                  text: 'M',
                  value: '150 320 63'
                },
                {
                  id: 'aedM+',
                  text: 'M+',
                  value: '150 320 70'
                }
              ]
            }
          },
          output: {
            levelUp: 0,
            requirePt: 0,
            commonLiveTimes: 0,
            eventLiveTimes: 0,
            requireItem: 0,
            requireStamina: 0,
            gameTime: '0日00:00:00',
            extraStamina: 0
          }
        },
        '2': {
          input: {
            currentMedal: {
              type: 'text',
              model: ''
            },
            targetMedal: {
              type: 'text',
              model: ''
            },
            starRank: {
              type: 'text',
              model: '15'
            },
            commonDifficulty: {
              type: 'radio',
              model: '19 24 1.0 63',
              option: [
                {
                  id: 'ccdR',
                  text: 'R',
                  value: '13 15 0.6 49'
                },
                {
                  id: 'ccdP',
                  text: 'P',
                  value: '16 20 0.7 56'
                },
                {
                  id: 'ccdM',
                  text: 'M',
                  value: '19 24 1.0 63'
                }
              ]
            }
          },
          output: {
            levelUp: 0,
            extraRewardOdds: '100%/0%/0%',
            averageMedal: 0,
            requireMedal: 0,
            commonLiveTimes: 0,
            requireStamina: 0,
            gameTime: '0日00:00:00',
            extraStamina: 0
          }
        },
        '3': {
          input: {
            currentPt: {
              type: 'text',
              model: ''
            },
            targetPt: {
              type: 'text',
              model: ''
            },
            eventDifficulty: {
              type: 'radio',
              model: '4 50 114 180',
              option: [
                {
                  id: 'medD',
                  text: 'D',
                  value: '0 20 32 117'
                },
                {
                  id: 'medR',
                  text: 'R',
                  value: '1 30 53 141'
                },
                {
                  id: 'medP',
                  text: 'P',
                  value: '2 40 76 159'
                },
                {
                  id: 'medM',
                  text: 'M',
                  value: '3 50 103 180'
                },
                {
                  id: 'medM+',
                  text: 'M+',
                  value: '4 50 114 180'
                }
              ]
            },
            hakoyureLevel: {
              type: 'radio',
              model: '144 239 343 461 461',
              option: [
                /* {
                  id: 'mhl0',
                  text: '0',
                  value: '119 192 279 379 379'
                }, */
                {
                  id: 'mhl20',
                  text: '20',
                  value: '127 208 301 407 407'
                },
                {
                  id: 'mhl30',
                  text: '30',
                  value: '134 221 320 432 432'
                },
                {
                  id: 'mhl40',
                  text: '40',
                  value: '140 233 335 451 451'
                },
                {
                  id: 'mhl50',
                  text: '50',
                  value: '144 239 343 461 461'
                }
              ]
            }
          },
          output: {
            levelUp: 0,
            requirePt: 0,
            eventLiveTimes: 0,
            requireStamina: 0,
            gameTime: '0日00:00:00',
            extraStamina: 0
          }
        },
        '5': {
          input: {
            currentAudience: {
              type: 'text',
              model: ''
            },
            targetAudience: {
              type: 'text',
              model: ''
            },
            areaStamina: {
              type: 'radio',
              model: '50 3 22000 179',
              option: [
                {
                  id: 'tas10',
                  text: '10',
                  value: '10 1 3400 32'
                },
                {
                  id: 'tas15',
                  text: '15',
                  value: '15 1 5600 53'
                },
                {
                  id: 'tas20',
                  text: '20',
                  value: '20 1 8000 74'
                },
                {
                  id: 'tas25',
                  text: '25',
                  value: '25 2 8900 85'
                },
                {
                  id: 'tas30',
                  text: '30',
                  value: '30 2 11700 106'
                },
                {
                  id: 'tas35',
                  text: '35',
                  value: '35 2 14700 126'
                },
                {
                  id: 'tas40',
                  text: '40',
                  value: '40 3 14900 139'
                },
                {
                  id: 'tas45',
                  text: '45',
                  value: '45 3 18400 160'
                },
                {
                  id: 'tas50',
                  text: '50',
                  value: '50 3 22000 179'
                }
              ]
            },
            liveOption: {
              type: 'radio',
              model: '0',
              option: [
                {
                  id: 'tlo1',
                  text: 'smoke',
                  value: '0.03'
                },
                {
                  id: 'tlo3',
                  text: 'firework',
                  value: '0.1'
                },
                {
                  id: 'tlo2',
                  text: 'laser',
                  value: '0.05'
                },
                {
                  id: 'tlo0',
                  text: '無し',
                  value: '0'
                }
              ]
            }
          },
          output: {
            levelUp: 0,
            requireAudience: 0,
            eventLiveTimes: 0,
            requireStamina: 0,
            gameTime: '0日00:00:00',
            extraStamina: 0
          }
        }
      }
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
          }
        }, 1000)
      }
    },
    calculate () {
      this.playSe(this.enterSe)
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.hope'))
    },
    clear () {
      this.playSe(this.cancelSe)
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.hope'))
    },
    timeFormate (t) {
      let day = Math.floor(t / 1000 / 60 / 60 / 24)
      let hour = Math.floor(t / 1000 / 60 / 60 % 24)
      let minute = Math.floor(t / 1000 / 60 % 60)
      let second = Math.floor(t / 1000 % 60)
      return `${day ? day + '日' : ''}${hour ? (hour >= 10 ? hour + ':' : ('0' + hour + ':')) : ''}${minute >= 10 ? minute : '0' + minute}:${second >= 10 ? second : '0' + second}`
    }
    /* test (v) {
      console.log(this.publicStatus)
    } */
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
