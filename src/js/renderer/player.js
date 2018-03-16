import fs from 'fs'
import getPath from '../common/get-path.js'

const bgmList = {
  anni: {
    src: './asset/sound/bgm/bgm_event_3017.mp3',
    start: 31.35,
    end: 86.95
  },
  day: {
    src: './asset/sound/bgm/bgm_studio_day.mp3',
    start: 13.704,
    end: 95.165
  },
  night: {
    src: './asset/sound/bgm/bgm_studio_night.mp3',
    start: 12.94,
    end: 98.79
  },
  sunset: {
    src: './asset/sound/bgm/bgm_studio_sunset.mp3',
    start: 13.075,
    end: 100.575
  },
  idol: {
    src: './asset/sound/bgm/bgm_idol_menu.mp3',
    start: 0.990,
    end: 80.900
  },
  gacha: {
    src: './asset/sound/bgm/bgm_gacha_menu.mp3',
    start: 1.800,
    end: 56.599
  },
  caravan: {
    src: './asset/sound/bgm/bgm_event_typeA.mp3'
  },
  rail: {
    src: './asset/sound/bgm/bgm_event_rail.mp3',
    start: 14.600,
    end: 94.560
  }
}

export default {
  data () {
    return {
      bgmTimer: 0,
      startTime: 0,
      endTime: 0,
      isPlaying: false,
      bgmList,
      isShow: false,
      playing: bgmList.anni
    }
  },
  props: {
    'master': {
      type: Object,
      require: true
    }
  },
  computed: {
    eventInfo () {
      return this.master.eventData
    }
  },
  methods: {
    initSrc () {
      let t = new Date()
      if (t.getHours() >= 5 && t.getHours() <= 16) {
        return bgmList.day.src
      } else if (t.getHours() < 5 || t.getHours() >= 20) {
        return bgmList.night.src
      } else {
        return bgmList.sunset.src
      }
    },
    pauseButton () {
      this.playSe(this.cancelSe)
      if (this.isPlaying) {
        this.pause()
      } else {
        this.play()
      }
    },
    selectBgm () {
      this.playSe(this.enterSe)
      this.isShow = !this.isShow
    },
    set (bgm) {
      this.bgm.src = bgm.src
      this.startTime = bgm.start
      this.endTime = bgm.end
      this.playing = bgm
    },
    playStudioBgm () {
      let t = new Date()
      if (t.getHours() >= 5 && t.getHours() <= 16) {
        this.play(bgmList.day)
      } else if (t.getHours() < 5 || t.getHours() >= 20) {
        this.play(bgmList.night)
      } else {
        this.play(bgmList.sunset)
      }
    },
    play (bgm) {
      if (bgm) {
        this.set(bgm)
        this.event.$emit('playerSelect', bgm.src.split('/')[bgm.src.split('/').length - 1])
      }
      setTimeout(() => {
        clearInterval(this.bgmTimer)
        this.bgm.volume = 1
        this.bgm.play()
        this.isPlaying = true
        if (this.startTime && this.endTime) {
          this.bgm.onended = null
          this.bgmTimer = setInterval(() => {
            if (this.bgm.currentTime >= this.endTime) {
              this.bgm.currentTime = this.startTime
              this.bgm.play()
            }
          }, 1)
        } else {
          this.bgm.onended = function () {
            this.currentTime = 0
            this.play()
          }
        }
      }, 0)
    },
    pause () {
      this.bgm.pause()
      this.isPlaying = false
      clearInterval(this.bgmTimer)
    }
  },
  beforeMount () {
    this.$nextTick(() => {
      let msrEvent = localStorage.getItem('msrEvent')
      if (msrEvent) {
        let o = JSON.parse(msrEvent)
        if ((o.id + '').charAt(0) !== '2' && (o.id + '').charAt(0) !== '6') {
          if (fs.existsSync(getPath(`./public/asset/sound/bgm/bgm_event_${o.id}.mp3`))) {
            this.set({ src: `./asset/sound/bgm/bgm_event_${o.id}.mp3` })
          }
        } else {
          this.set(bgmList.anni)
        }
      } else {
        this.set(bgmList.anni)
      }
    })
  },
  mounted () {
    this.$nextTick(() => {
      // this.setStudioBgm();
      this.play()
      let charaTitleVoiceArr = fs.readdirSync(getPath('./public/asset/sound/chara_title.asar'))
      for (let i = 0; i < charaTitleVoiceArr.length; i++) {
        charaTitleVoiceArr[i] = './asset/sound/chara_title.asar/' + charaTitleVoiceArr[i]
      }
      charaTitleVoiceArr.push('./asset/sound/se/chara_title.mp3')
      this.playSe(new Audio(charaTitleVoiceArr[Math.floor(Math.random() * charaTitleVoiceArr.length)]))
      window.bgm = this.bgm
      document.addEventListener('click', (e) => {
        if (this.isShow && e.target !== document.getElementById('pauseBtn')) {
          this.isShow = false
        }
      }, false)

      this.event.$on('ready', () => {
        this.playStudioBgm()
      })
      this.event.$on('changeBgm', (block) => {
        let flag = false
        for (let b in bgmList) {
          if (bgmList[b].src === this.playing.src) {
            flag = true
            break
          }
        }
        if (this.playing.src === `./asset/sound/bgm/bgm_event_${this.eventInfo.id}.mp3`) {
          flag = true
        }
        if (flag) {
          switch (block) {
            case 'home':
              if (this.playing.src !== bgmList.day.src && this.playing.src !== bgmList.sunset.src && this.playing.src !== bgmList.night.src) {
                this.playStudioBgm()
              }
              break
            case 'idol':
              if (this.playing.src !== bgmList.idol.src) {
                this.play(bgmList.idol)
              }
              break
            case 'live':
              if (this.master.eventHappening) {
                if (this.eventInfo.type == 2) {
                  if (this.playing.src !== bgmList.caravan.src) {
                    this.play(bgmList.caravan)
                  }
                } else if (this.eventInfo.type == 6) {
                  if (this.playing.src !== bgmList.rail.src) {
                    this.play(bgmList.rail)
                  }
                } else {
                  if (this.playing.src !== `./asset/sound/bgm/bgm_event_${this.eventInfo.id}.mp3`) {
                    this.event.$emit('liveSelect', { src: `./asset/sound/bgm/bgm_event_${this.eventInfo.id}.mp3` })
                  }
                }
              }
              break
            case 'gacha':
              if (this.playing.src !== bgmList.gacha.src) {
                this.play(bgmList.gacha)
              }
              break
            case 'menu':
              if (this.playing.src !== bgmList.day.src && this.playing.src !== bgmList.sunset.src && this.playing.src !== bgmList.night.src) {
                this.playStudioBgm()
              }
              break
            default:
              break
          }
        }
      })
      this.event.$on('liveSelect', (bgm) => {
        let flag = false
        for (let b in bgmList) {
          if (bgmList[b].src === bgm.src) {
            flag = true
            this.play(bgmList[b])
            break
          }
        }
        if (!flag) {
          this.play(bgm)
        }
      })
    })
  }
}
