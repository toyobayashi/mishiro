import { shell, ipcRenderer, Event, clipboard } from 'electron'
import { Vue, Component, Prop } from 'vue-property-decorator'
import fs from './fs'
import * as path from 'path'
import TaskLoading from '../../vue/component/TaskLoading.vue'
import InputText from '../../vue/component/InputText.vue'
import { generateObjectId } from '../common/object-id'

import getPath from './get-path'
import { MasterData } from '../main/on-master-read'

const { scoreDir, bgmDir, liveDir } = getPath

@Component({
  components: {
    TaskLoading,
    InputText
  },
  filters: {
    time (second: number) {
      let min: string | number = Math.floor(second / 60)
      let sec: string | number = Math.floor(second % 60)
      if (min < 10) {
        min = '0' + min
      }
      if (sec < 10) {
        sec = '0' + sec
      }
      return `${min}:${sec}`
    }
  }
})
export default class extends Vue {
  dler = new this.core.Downloader()
  scoreDownloader = new this.core.Downloader()
  queryString: string = ''
  total: number = 0
  current: number = 0
  text: string = ''
  activeAudio: any = {}
  duration: number = 100
  currentTime: number = 0
  allLive: boolean = true
  liveQueryList: any[] = []
  isGameRunning: boolean = false
  allLyrics: { time: number; lyrics: string; size: any}[] = []
  lyrics: { time: number; lyrics: string; size: any}[] = []

  @Prop({ default: () => ({}) }) master: MasterData

  get liveManifest () {
    return this.master.liveManifest ? this.master.liveManifest : []
  }
  get bgmManifest () {
    return this.master.bgmManifest ? this.master.bgmManifest : []
  }

  oninput () {
    this.bgm.currentTime = Number((this.$refs.playProg as HTMLInputElement).value)
  }
  async selectAudio (audio: any) {
    if (this.activeAudio.hash === audio.hash) return

    this.playSe(this.enterSe)

    this.total = 0
    this.current = 0
    this.text = ''

    if (audio.name.split('/')[0] === 'b') {
      if (!fs.existsSync(bgmDir(audio.fileName))) {
        if (navigator.onLine) {
          this.dler.stop()
          this.activeAudio = audio
          let result: string | boolean = false
          try {
            // result = await this.dler.downloadOne(
            //   this.getBgmUrl(audio.hash),
            //   bgmDir(audio.name.split('/')[1]),
            //   (prog) => {
            //     this.text = prog.name as string
            //     this.current = prog.loading
            //     this.total = prog.loading
            //   }
            // )
            result = await this.dler.downloadSound(
              'b',
              audio.hash,
              bgmDir(path.basename(audio.name)),
              (prog) => {
                this.text = prog.name as string
                this.current = prog.loading
                this.total = prog.loading
              }
            )
          } catch (errorPath) {
            this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
          }
          if (result) {
            this.total = 99.99
            this.current = 99.99
            this.text += this.$t('live.decoding')
            await this.acb2mp3(bgmDir(path.basename(audio.name)), audio.fileName)
            this.total = 0
            this.current = 0
            this.text = ''
            this.event.$emit('liveSelect', { src: `../../asset/bgm/${audio.fileName}` })
          }
        } else {
          this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noNetwork'))
        }
      } else {
        this.activeAudio = audio
        this.event.$emit('liveSelect', { src: `../../asset/bgm/${audio.fileName}` })
      }
    } else if (audio.name.split('/')[0] === 'l') {
      if (!fs.existsSync(liveDir(audio.fileName))) {
        if (!navigator.onLine) {
          this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noNetwork'))
          return
        }
        this.dler.stop()
        this.activeAudio = audio
        let result: string | boolean = false
        try {
          // result = await this.dler.downloadOne(
          //   this.getLiveUrl(audio.hash),
          //   liveDir(audio.name.split('/')[1]),
          //   (prog) => {
          //     this.text = prog.name as string
          //     this.current = prog.loading
          //     this.total = prog.loading
          //   }
          // )
          result = await this.dler.downloadSound(
            'l',
            audio.hash,
            liveDir(path.basename(audio.name)),
            (prog) => {
              this.text = prog.name as string
              this.current = prog.loading
              this.total = prog.loading
            }
          )
        } catch (errorPath) {
          this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
          return
        }

        if (!result) return

        this.total = 99.99
        this.current = 99.99
        this.text += this.$t('live.decoding')
        await this.acb2mp3(liveDir(path.basename(audio.name)), audio.fileName)
        this.total = 0
        this.current = 0
        this.text = ''
        this.event.$emit('liveSelect', { src: `../../asset/live/${audio.fileName}` })

      } else {
        this.activeAudio = audio
        this.event.$emit('liveSelect', { src: `../../asset/live/${audio.fileName}` })
      }

      this.lyrics = []
      this.allLyrics = []

      if (!this.activeAudio.score) return

      if (!fs.existsSync(scoreDir(this.activeAudio.score))) {
        if (!navigator.onLine) {
          this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noNetwork'))
          return
        }
        try {
          let scoreBdb = await this.scoreDownloader.downloadDatabase(
            this.activeAudio.scoreHash,
            scoreDir(this.activeAudio.score.split('.')[0])
          )
          if (scoreBdb) {
            // this.core.util.lz4dec(scoreBdb as string, 'bdb')
            fs.removeSync(scoreDir(this.activeAudio.score.split('.')[0]))
          } else {
            this.event.$emit('alert', this.$t('home.errorTitle'), 'Error!')
            return
          }
        } catch (errorPath) {
          this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
          return
        }
      }

      ipcRenderer.send('lyrics', scoreDir(this.activeAudio.score))

    }
  }
  query () {
    this.playSe(this.enterSe)
    if (this.queryString) {
      this.allLive = false
      this.liveQueryList = []
      const re = new RegExp(this.queryString)
      for (let i = 0; i < this.liveManifest.length; i++) {
        if (re.test(this.liveManifest[i].fileName)) {
          this.liveQueryList.push(this.liveManifest[i])
        }
      }
    } else {
      this.allLive = true
      this.liveQueryList = []
    }
  }
  opendir () {
    this.playSe(this.enterSe)
    const dirb = bgmDir()
    const dirl = liveDir()
    if (!fs.existsSync(dirb)) fs.mkdirsSync(dirb)
    if (!fs.existsSync(dirl)) fs.mkdirsSync(dirl)
    if (process.platform === 'win32') {
      shell.openExternal(dirb)
      shell.openExternal(dirl)
    } else {
      shell.showItemInFolder(dirb + '/.')
      shell.showItemInFolder(dirl + '/.')
    }
  }
  openLyrics () {
    const self = this
    this.event.$emit('alert', path.parse(this.activeAudio.fileName).name, this.allLyrics.map(line => line.lyrics).join('<br/>'), undefined, {
      text: this.$t('live.copy'),
      cb () {
        self.playSe(self.enterSe)
        clipboard.writeText(self.allLyrics.map(line => line.lyrics).join('\n'))
      }
    })
  }

  private async gameOrScore () {
    if (this.isGameRunning) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('live.gameRunning'))
      return false
    }

    if (!this.activeAudio.score) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('live.noScore'))
      return false
    }

    if (!fs.existsSync(liveDir(this.activeAudio.fileName))) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('live.noAudio'))
      return false
    }

    if (!fs.existsSync(scoreDir(this.activeAudio.score))) {
      try {
        // let scoreBdb = await this.scoreDownloader.downloadOne(
        //   this.getDbUrl(this.activeAudio.scoreHash),
        //   scoreDir(this.activeAudio.score.split('.')[0])
        // )
        let scoreBdb = await this.scoreDownloader.downloadDatabase(
          this.activeAudio.scoreHash,
          scoreDir(this.activeAudio.score.split('.')[0])
        )
        if (scoreBdb) {
          // this.core.util.lz4dec(scoreBdb as string, 'bdb')
          fs.removeSync(scoreDir(this.activeAudio.score.split('.')[0]))
        } else {
          this.event.$emit('alert', this.$t('home.errorTitle'), 'Error!')
          return false
        }
      } catch (errorPath) {
        this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
        return false
      }
    }

    return true
  }

  async startGame () {
    this.playSe(this.enterSe)
    const result = await this.gameOrScore()
    if (result) this.event.$emit('game', this.activeAudio)
  }

  async startScore () {
    this.playSe(this.enterSe)
    const result = await this.gameOrScore()
    if (!result) return
    const hasMasterPlus = await this.checkScore(scoreDir(this.activeAudio.score))
    this.event.$emit('score', this.activeAudio, hasMasterPlus)
  }

  private checkScore (scoreFile: string) {
    const id = generateObjectId()
    return new Promise<boolean>((resolve) => {
      ipcRenderer.once(id, (_e: Event, hasMasterPlus: boolean) => {
        resolve(hasMasterPlus)
      })
      ipcRenderer.send('checkScore', id, scoreFile)
    })
  }

  mounted () {
    this.$nextTick(() => {
      this.bgm.addEventListener('timeupdate', () => {
        this.currentTime = this.bgm.currentTime
        for (let i = this.allLyrics.length - 1; i >= 0; i--) {
          const line = this.allLyrics[i]
          if (this.bgm.currentTime >= line.time) {
            this.lyrics = i === this.allLyrics.length - 1 ? [this.allLyrics[i]] : [this.allLyrics[i], this.allLyrics[i + 1]]
            break
          }
        }
      }, false)
      this.bgm.addEventListener('durationchange', () => {
        this.duration = this.bgm.duration
      }, false)
      this.event.$on('playerSelect', (fileName: string) => {
        this.allLyrics = []
        this.lyrics = []
        if (this.bgmManifest.filter(bgm => bgm.fileName === fileName).length > 0) {
          this.activeAudio = this.bgmManifest.filter(bgm => bgm.fileName === fileName)[0]
        } else {
          this.activeAudio = this.liveManifest.filter(bgm => bgm.fileName === fileName)[0]
        }
      })
      this.event.$on('gameStart', () => {
        this.isGameRunning = true
      })
      this.event.$on('enterKey', (block: string) => {
        if (block === 'live') {
          this.query()
        }
      })
      ipcRenderer.on('liveEnd', (_event: Event, liveResult: any, isCompleted: boolean) => {
        this.isGameRunning = false
        if (isCompleted) this.playSe(new Audio('../../asset/se.asar/se_live_wow.mp3'))
        if (liveResult) this.event.$emit('showLiveResult', liveResult)
        else this.event.$emit('playBgm')
      })
      ipcRenderer.on('lyrics', (_event: Event, lyrics: { time: number; lyrics: string; size: any }[]) => {
        this.allLyrics = lyrics
      })
    })
  }
}
