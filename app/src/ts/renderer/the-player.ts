import { Vue, Component, Prop } from 'vue-property-decorator'
import { MasterData } from '../main/on-master-read'

const fs = window.node.fs
const getPath = window.preload.getPath

const { bgmDir } = getPath

interface BGMList {
  [key: string]: {
    src: string
    start?: number
    end?: number
    hidden?: boolean
  }
}

export const bgmList: BGMList = {
  anni: {
    src: '../../asset/bgm.asar/bgm_event_3023.mp3',
    start: 13.90,
    end: 95.00
  },
  day: {
    src: '../../asset/bgm.asar/bgm_studio_day.mp3',
    start: 13.704,
    end: 95.165
  },
  night: {
    src: '../../asset/bgm.asar/bgm_studio_night.mp3',
    start: 12.94,
    end: 98.79
  },
  sunset: {
    src: '../../asset/bgm.asar/bgm_studio_sunset.mp3',
    start: 13.075,
    end: 100.575
  },
  idol: {
    src: '../../asset/bgm.asar/bgm_idol_menu.mp3',
    start: 0.990,
    end: 80.900
  },
  // gacha: {
  //   src: '../../asset/bgm.asar/bgm_gacha_menu.mp3',
  //   start: 1.800,
  //   end: 56.599
  // },
  commu: {
    src: '../../asset/bgm.asar/bgm_commu_menu.mp3',
    start: 2.6,
    end: 45.2
  },
  caravan: {
    src: '../../asset/bgm.asar/bgm_event_typeA.mp3'
  },
  rail: {
    src: '../../asset/bgm.asar/bgm_event_rail.mp3',
    start: 14.600,
    end: 94.560
  }
}

@Component
export default class extends Vue {

  bgmTimer: number | NodeJS.Timer = 0
  startTime: number = 0
  endTime: number = 0
  isPlaying: boolean = false
  isShow: boolean = false
  playing: any = bgmList.anni

  @Prop({ type: Object, default: (() => ({})) }) master!: MasterData

  get eventInfo () {
    return this.master.eventData
  }

  get bgmList () {
    const list: BGMList = {}
    for (let k in bgmList) {
      if (!bgmList[k].hidden) {
        list[k] = { ...bgmList[k] }
      }
    }
    return list
  }

  initSrc () {
    let t = new Date()
    if (t.getHours() >= 5 && t.getHours() <= 16) {
      return bgmList.day.src
    } else if (t.getHours() < 5 || t.getHours() >= 20) {
      return bgmList.night.src
    } else {
      return bgmList.sunset.src
    }
  }
  pauseButton () {
    this.playSe(this.cancelSe)
    if (this.isPlaying) {
      this.pause()
    } else {
      this.play()
    }
  }
  selectBgm () {
    this.playSe(this.enterSe)
    this.isShow = !this.isShow
  }
  set (bgm: any) {
    this.bgm.src = bgm.src
    this.startTime = bgm.start
    this.endTime = bgm.end
    this.playing = bgm
  }
  playStudioBgm () {
    let t = new Date()
    if (t.getHours() >= 5 && t.getHours() <= 16) {
      this.play(bgmList.day)
    } else if (t.getHours() < 5 || t.getHours() >= 20) {
      this.play(bgmList.night)
    } else {
      this.play(bgmList.sunset)
    }
  }
  play (bgm?: any) {
    if (bgm) {
      this.set(bgm)
      this.event.$emit('playerSelect', bgm.src.split('/')[bgm.src.split('/').length - 1])
    }
    setTimeout(() => {
      clearInterval(this.bgmTimer as NodeJS.Timer)
      this.bgm.volume = 1
      this.bgm.play().catch(err => console.log(err))
      this.isPlaying = true
      if (this.startTime && this.endTime) {
        (this.bgm.onended as any) = null
        this.bgmTimer = setInterval(() => {
          if (this.bgm.currentTime >= this.endTime) {
            this.bgm.currentTime = this.startTime
            this.bgm.play().catch(err => console.log(err))
          }
        }, 1)
      } else {
        let windowbgm = this.bgm
        this.bgm.onended = function () {
          windowbgm.currentTime = 0
          windowbgm.play().catch(err => console.log(err))
        }
      }
    }, 0)
  }
  pause () {
    this.bgm.pause()
    this.isPlaying = false
    clearInterval(this.bgmTimer as NodeJS.Timer)
  }

  beforeMount () {
    this.$nextTick(() => {
      let msrEvent = localStorage.getItem('msrEvent')
      if (msrEvent) {
        let o = JSON.parse(msrEvent)
        if ((o.id + '').charAt(0) !== '2' && (o.id + '').charAt(0) !== '6') {
          if (fs.existsSync(bgmDir(`bgm_event_${o.id}.mp3`))) {
            this.set({ src: `../../asset/bgm/bgm_event_${o.id}.mp3` })
          } else {
            this.set(bgmList.anni)
          }
        } else {
          this.set(bgmList.anni)
        }
      } else {
        this.set(bgmList.anni)
      }
    })
  }
  mounted () {
    this.$nextTick(() => {
      // this.setStudioBgm();
      this.play()
      let charaTitleVoiceArr = fs.readdirSync(getPath('../asset/chara_title.asar'))
      for (let i = 0; i < charaTitleVoiceArr.length; i++) {
        charaTitleVoiceArr[i] = '../../asset/chara_title.asar/' + charaTitleVoiceArr[i]
      }
      charaTitleVoiceArr.push('../../asset/se.asar/chara_title.mp3')
      this.playSe(new Audio(charaTitleVoiceArr[Math.floor(Math.random() * charaTitleVoiceArr.length)]));
      (window as any).bgm = this.bgm
      document.addEventListener('click', (e) => {
        if (this.isShow && e.target !== document.getElementById('pauseBtn')) {
          this.isShow = false
        }
      }, false)

      this.event.$on('play-studio-bgm', () => {
        this.playStudioBgm()
      })

      this.event.$on('changeBgm', (block: string) => {
        let flag = false
        for (let b in bgmList) {
          if (bgmList[b].src === this.playing.src) {
            flag = true
            break
          }
        }
        if (this.playing.src === `../../asset/bgm/bgm_event_${this.eventInfo.id}.mp3`) {
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
                if (Number(this.eventInfo.type) === 2) {
                  if (this.playing.src !== bgmList.caravan.src) {
                    this.play(bgmList.caravan)
                  }
                } else if (Number(this.eventInfo.type) === 6) {
                  if (this.playing.src !== bgmList.rail.src) {
                    this.play(bgmList.rail)
                  }
                } else {
                  if (this.playing.src !== `../../asset/bgm/bgm_event_${this.eventInfo.id}.mp3`) {
                    this.event.$emit('liveSelect', { src: `../../asset/bgm/bgm_event_${this.eventInfo.id}.mp3` })
                  }
                }
              }
              break
            // case 'gacha':
            //   if (this.playing.src !== bgmList.gacha.src) {
            //     this.play(bgmList.gacha)
            //   }
            //   break
            case 'commu':
              if (this.playing.src !== bgmList.commu.src) {
                this.play(bgmList.commu)
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
      this.event.$on('liveSelect', (bgm: any) => {
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
      this.event.$on('pauseBgm', () => {
        this.pause()
      })
      this.event.$on('playBgm', () => {
        this.play()
      })
    })
  }
}
