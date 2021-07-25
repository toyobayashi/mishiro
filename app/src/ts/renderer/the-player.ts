import { Vue, Component } from 'vue-property-decorator'
// import { MasterData } from '../main/on-master-read'
import getPath from '../common/get-path'
const fs = window.node.fs
const path = window.node.path

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
    src: getPath('../asset/bgm.asar/bgm_event_anniversary_005.mp3'), // '../../asset/bgm.asar/bgm_event_anniversary_005.mp3',
    start: 15,
    end: 87.65
  },
  day: {
    src: getPath('../asset/bgm.asar/bgm_studio_day.mp3'), // '../../asset/bgm.asar/bgm_studio_day.mp3',
    start: 13.704,
    end: 95.165
  },
  night: {
    src: getPath('../asset/bgm.asar/bgm_studio_night.mp3'), // '../../asset/bgm.asar/bgm_studio_night.mp3',
    start: 12.94,
    end: 98.79
  },
  sunset: {
    src: getPath('../asset/bgm.asar/bgm_studio_sunset.mp3'), // '../../asset/bgm.asar/bgm_studio_sunset.mp3',
    start: 13.075,
    end: 100.575
  },
  idol: {
    src: getPath('../asset/bgm.asar/bgm_idol_menu.mp3'), // '../../asset/bgm.asar/bgm_idol_menu.mp3',
    start: 0.990,
    end: 80.900
  },
  // gacha: {
  //   src: '../../asset/bgm.asar/bgm_gacha_menu.mp3',
  //   start: 1.800,
  //   end: 56.599
  // },
  commu: {
    src: getPath('../asset/bgm.asar/bgm_commu_menu.mp3'), // '../../asset/bgm.asar/bgm_commu_menu.mp3',
    start: 2.6,
    end: 45.2
  },
  caravan: {
    src: getPath('../asset/bgm.asar/bgm_event_typeA.mp3') // '../../asset/bgm.asar/bgm_event_typeA.mp3'
  },
  rail: {
    src: getPath('../asset/bgm.asar/bgm_event_rail.mp3'), // '../../asset/bgm.asar/bgm_event_rail.mp3',
    start: 14.600,
    end: 94.560
  }
}

@Component
export default class extends Vue {
  isPlaying: boolean = false
  isShow: boolean = false
  playing: {
    src: string
    start?: number
    end?: number
  } = bgmList.anni

  // @Prop({ type: Object, default: () => ({}) }) master!: MasterData

  get eventInfo (): any {
    return this.$store.state.master.eventData
  }

  get bgmList (): BGMList {
    const list: any = {}
    const bgmListCopy: BGMList = JSON.parse(JSON.stringify(bgmList))
    for (const k in bgmListCopy) {
      if (!bgmListCopy[k].hidden) {
        list[k] = { ...bgmListCopy[k] }
        list[k].displayName = path.basename(list[k].src)
        list[k].id = list[k].displayName.split('.')[0]
      }
    }
    return list
  }

  get currentPlayingDisplay (): string {
    return this.playing ? path.basename(this.playing.src) : ''
  }

  initSrc (): string {
    const t = new Date()
    if (t.getHours() >= 5 && t.getHours() <= 16) {
      return bgmList.day.src
    } else if (t.getHours() < 5 || t.getHours() >= 20) {
      return bgmList.night.src
    } else {
      return bgmList.sunset.src
    }
  }

  async pauseButton (): Promise<void> {
    this.playSe(this.cancelSe)
    if (this.isPlaying) {
      this.pause()
    } else {
      await this.play()
    }
  }

  selectBgm (): void {
    this.playSe(this.enterSe)
    this.isShow = !this.isShow
  }

  async playStudioBgm (): Promise<void> {
    const t = new Date()
    if (t.getHours() >= 5 && t.getHours() <= 16) {
      await this.play(bgmList.day)
    } else if (t.getHours() < 5 || t.getHours() >= 20) {
      await this.play(bgmList.night)
    } else {
      await this.play(bgmList.sunset)
    }
  }

  async play (bgm?: any): Promise<void> {
    if (bgm) {
      this.bgm.loopStart = bgm.start || 0
      this.bgm.loopEnd = bgm.end || 0
      await this.bgm.playRaw(bgm.src)
      this.playing = bgm
      this.isPlaying = true
      this.event.$emit('playerSelect', path.parse(bgm.src).name)
    } else {
      await this.bgm.play()
      this.isPlaying = true
    }
  }

  pause (): void {
    this.bgm.pause()
    this.isPlaying = false
  }

  beforeMount (): void {
    this.$nextTick(async () => {
      const msrEvent = localStorage.getItem('msrEvent')
      if (msrEvent) {
        let o: any
        try {
          o = JSON.parse(msrEvent)
        } catch (_) {
          await this.play(bgmList.anni)
          return
        }
        if ((o.id.toString()).charAt(0) !== '2' && (o.id.toString()).charAt(0) !== '6') {
          if (fs.existsSync(bgmDir(`bgm_event_${o.id}.mp3`))) {
            // this.play({ src: `../../asset/bgm/bgm_event_${o.id}.mp3` })
            await this.play({ src: getPath(`../asset/bgm/bgm_event_${o.id}.mp3`) /* `../../asset/bgm/bgm_event_${o.id}.mp3` */ })
          } else {
            await this.play(bgmList.anni)
          }
        } else {
          await this.play(bgmList.anni)
        }
      } else {
        await this.play(bgmList.anni)
      }
    })
  }

  mounted (): void {
    this.$nextTick(() => {
      // this.setStudioBgm();
      // this.play()
      const charaTitleVoiceArr = fs.readdirSync(getPath('../asset/chara_title.asar'))
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

      this.event.$on('play-studio-bgm', async () => {
        await this.playStudioBgm()
      })

      this.event.$on('changeBgm', async (block: string) => {
        let flag = false
        for (const b in bgmList) {
          if (bgmList[b].src === this.playing.src) {
            flag = true
            break
          }
        }
        if (this.playing.src === getPath(`../asset/bgm/bgm_event_${this.eventInfo.id}.mp3`)) {
          flag = true
        }
        if (flag) {
          switch (block) {
            case 'home':
              if (this.playing.src !== bgmList.day.src && this.playing.src !== bgmList.sunset.src && this.playing.src !== bgmList.night.src) {
                await this.playStudioBgm()
              }
              break
            case 'idol':
              if (this.playing.src !== bgmList.idol.src) {
                await this.play(bgmList.idol)
              }
              break
            case 'live':
              if (this.$store.state.master.eventHappening) {
                if (Number(this.eventInfo.type) === 2) {
                  if (this.playing.src !== bgmList.caravan.src) {
                    await this.play(bgmList.caravan)
                  }
                } else if (Number(this.eventInfo.type) === 6) {
                  if (this.playing.src !== bgmList.rail.src) {
                    await this.play(bgmList.rail)
                  }
                } else {
                  const eventBgmSrc = getPath(`../asset/bgm/bgm_event_${this.eventInfo.id}.mp3`)
                  if (this.playing.src !== eventBgmSrc) {
                    this.event.$emit('liveSelect', { src: eventBgmSrc })
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
                await this.play(bgmList.commu)
              }
              break
            case 'menu':
              if (this.playing.src !== bgmList.day.src && this.playing.src !== bgmList.sunset.src && this.playing.src !== bgmList.night.src) {
                await this.playStudioBgm()
              }
              break
            default:
              break
          }
        }
      })
      this.event.$on('liveSelect', async (bgm: any) => {
        let flag = false
        for (const b in bgmList) {
          if (bgmList[b].src === bgm.src) {
            flag = true
            await this.play(bgmList[b])
            break
          }
        }
        if (!flag) {
          await this.play(bgm)
        }
      })
      this.event.$on('pauseBgm', () => {
        this.pause()
      })
      this.event.$on('playBgm', async () => {
        await this.play()
      })
    })
  }
}
