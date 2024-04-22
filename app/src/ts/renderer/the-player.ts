import { Vue, Component } from 'vue-property-decorator'
// import { MasterData } from '../main/on-master-read'
import getPath from '../common/get-path'
import type { BGM } from './back/resolve-audio-manifest'
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
    src: getPath('../asset/bgm.asar/bgm_event_anniversary_006.hca')
  },
  day: {
    src: getPath('../asset/bgm.asar/bgm_studio_day.hca')
  },
  night: {
    src: getPath('../asset/bgm.asar/bgm_studio_night.hca')
  },
  sunset: {
    src: getPath('../asset/bgm.asar/bgm_studio_sunset.hca')
  },
  idol: {
    src: getPath('../asset/bgm.asar/bgm_idol_menu.hca')
  },
  // gacha: {
  //   src: '../../asset/bgm.asar/bgm_gacha_menu.hca'
  // },
  commu: {
    src: getPath('../asset/bgm.asar/bgm_commu_menu.hca')
  },
  caravan: {
    src: getPath('../asset/bgm.asar/bgm_event_typeA.hca')
  },
  rail: {
    src: getPath('../asset/bgm.asar/bgm_event_rail.hca')
  },
  meetup: {
    src: getPath('../asset/bgm.asar/bgm_event_meetup.hca')
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
      if (path.extname(bgm.src) === '.hca') {
        await this.bgm.playHca(bgm.src)
      } else {
        await this.bgm.playRaw(bgm.src)
      }
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
          if (fs.existsSync(bgmDir(`bgm_event_${o.id}.hca`))) {
            await this.play({ src: getPath(`../asset/bgm/bgm_event_${o.id}.hca`) })
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
        for (const b in bgmList) {
          const audio = this.$store.state.master.bgmManifest.filter((bb: BGM) => bb.fileName === path.parse(bgmList[b].src).name)[0]
          if (audio) {
            this.$set(audio, '_canplay', true)
          }
        }
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
        if (this.playing.src === getPath(`../asset/bgm/bgm_event_${this.eventInfo.id}.hca`)) {
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
                const eventType = Number(this.eventInfo.type)
                if (eventType === 2) {
                  if (this.playing.src !== bgmList.caravan.src) {
                    await this.play(bgmList.caravan)
                  }
                } else if (eventType === 6) {
                  if (this.playing.src !== bgmList.rail.src) {
                    await this.play(bgmList.rail)
                  }
                } else if (eventType === 9) {
                  if (this.playing.src !== bgmList.meetup.src) {
                    await this.play(bgmList.meetup)
                  }
                } else {
                  const eventBgmSrc = getPath(`../asset/bgm/bgm_event_${this.eventInfo.id}.hca`)
                  if (this.playing.src !== eventBgmSrc && fs.existsSync(eventBgmSrc)) {
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
