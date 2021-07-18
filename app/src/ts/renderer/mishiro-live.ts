import type { Event } from 'electron'
import { Vue, Component } from 'vue-property-decorator'

import TabSmall from '../../vue/component/TabSmall.vue'

import TaskLoading from '../../vue/component/TaskLoading.vue'
import InputText from '../../vue/component/InputText.vue'
import { unpackTexture2D } from './unpack-texture-2d'
// import { generateObjectId } from '../common/object-id'

// import { MasterData } from '../main/on-master-read'

import getPath from '../common/get-path'
import { getLyrics, getScoreDifficulties, showSaveDialog } from './ipc'
import type { DownloadPromise } from 'mishiro-core'
import configurer from './config'
import type { MishiroConfig } from '../main/config'
import type { Live, BGM } from './back/resolve-audio-manifest'
import { setAudioList } from './store'

const fs = window.node.fs
const path = window.node.path
const os = window.node.os
const iconvLite = window.node.iconvLite
const { shell, ipcRenderer, clipboard } = window.node.electron
const { scoreDir, bgmDir, liveDir, jacketDir } = getPath

function filterTime (second: number, float = false): string {
  let min: string | number = Math.floor(second / 60)
  let sec: string | number = Math.floor(second % 60)
  if (min < 10) {
    min = `0${min}`
  }
  if (sec < 10) {
    sec = `0${sec}`
  }
  if (float) {
    const floatPart = String(second).split('.')[1]
    return floatPart ? `${min}:${sec}.${('0' + floatPart).slice(-2)}` : `${min}:${sec}.00`
  }
  return `${min}:${sec}`
}

@Component({
  components: {
    TaskLoading,
    InputText,
    TabSmall
  },
  filters: {
    time (second: number) {
      return filterTime(second, false)
    }
  }
})
export default class extends Vue {
  dler = new this.core.Downloader()
  audioDownloadPromise: DownloadPromise<string> | null = null
  scoreDownloader = new this.core.Downloader()
  jacketDownloader = new this.core.Downloader()
  queryString: string = ''
  total: number = 0
  current: number = 0
  text: string = ''
  activeAudio: BGM | Live = {} as any
  duration: number = 100
  currentTime: number = 0
  isGameRunning: boolean = false
  allLyrics: Array<{ time: number, lyrics: string, size: any}> = []
  lyrics: Array<{ time: number, lyrics: string, size: any}> = []
  jacketSrc: string = ''

  audioTypeTabs = {
    bgm: 'BGM',
    live: 'LIVE'
  }

  currentAudioType = 'BGM'
  audioDownloading = false

  selectedAudios: Array<BGM | Live> = []
  downloadingTasks: Array<BGM | Live> = []
  lastClickedAudio: BGM | Live | null = null
  controlDown = false
  shiftDown = false

  // @Prop({ default: () => ({}) }) master: MasterData

  get liveManifest (): Live[] {
    return this.$store.state.master.liveManifest || []
    // return this.master.liveManifest ? this.master.liveManifest : []
  }

  get bgmManifest (): BGM[] {
    return this.$store.state.master.bgmManifest || []
    // return this.master.bgmManifest ? this.master.bgmManifest : []
  }

  get wavProgress (): boolean {
    return this.core.config.getProgressCallback()
  }

  get audioListData (): BGM[] | Live[] {
    return this.$store.state.audioListData || []
  }

  created (): void {
    const proxy = configurer.get('proxy') ?? ''
    this.dler.setProxy(proxy)
    this.scoreDownloader.setProxy(proxy)
    this.jacketDownloader.setProxy(proxy)
    this.event.$on('optionSaved', (options: MishiroConfig) => {
      const configProxy = options.proxy ?? ''
      this.dler.setProxy(configProxy)
      this.scoreDownloader.setProxy(configProxy)
      this.jacketDownloader.setProxy(configProxy)
    })
  }

  oninput (target: HTMLInputElement): void {
    this.bgm.currentTime = Number(target.value)
  }

  stopDownload (): void {
    this.playSe(this.cancelSe)
    this.current = 0
    this.total = this.current
    this.downloadingTasks = []
    if (this.audioDownloadPromise) {
      this.audioDownloadPromise.download.abort()
    }
    this.audioDownloading = false
  }

  async downloadSelectedItem (): Promise<void> {
    this.playSe(this.enterSe)
    if (!navigator.onLine) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noNetwork'))
      return
    }
    this.downloadingTasks = this.selectedAudios.slice(0)

    if (this.downloadingTasks.length <= 0) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noEmptyDownload'))
      return
    }

    this.audioDownloading = true

    let completeCount = 0

    for (let i = 0; i < this.downloadingTasks.length; i++) {
      const audio = this.downloadingTasks[i]
      const audioType = audio.name.split('/')[0]
      const acbBase = path.posix.basename(audio.name)
      const type = configurer.get('audioExport') ?? 'wav'
      const audioFileName = audio.fileName + '.' + type
      const needAwb = !!audio.awbHash

      const dir = audioType === 'b' ? bgmDir : (audioType === 'l' ? liveDir : null)
      if (!dir) {
        this.event.$emit('alert', this.$t('home.errorTitle'), 'Bad type')
        completeCount++
        continue
      }
      const audioFilePath = dir(audioFileName)
      if (fs.existsSync(audioFilePath)) {
        completeCount++
        continue
      }

      let result: string
      const acbPath = dir(acbBase)
      try {
        this.audioDownloadPromise = this.dler.downloadSound(
          audioType,
          audio.hash,
          acbPath,
          (prog) => {
            this.text = `[${completeCount}/${this.downloadingTasks.length}] ${prog.name as string}`
            if (!needAwb) {
              const currentPercent = prog.loading / (this.wavProgress ? 2 : 1)
              this.$set(audio, '_percent', currentPercent)
              this.current = (100 * completeCount / this.downloadingTasks.length) + currentPercent / this.downloadingTasks.length
              this.total = this.current
            }
          }
        )
        result = await this.audioDownloadPromise
        this.audioDownloadPromise = null
        if (needAwb) {
          this.audioDownloadPromise = this.dler.downloadSound(
            audioType,
            audio.awbHash!,
            dir(path.parse(audio.name).name + '.awb'),
            (prog) => {
              this.text = `[${completeCount}/${this.downloadingTasks.length}] ${prog.name as string}`
              const currentPercent = prog.loading / (this.wavProgress ? 2 : 1)
              this.$set(audio, '_percent', currentPercent)
              this.current = (100 * completeCount / this.downloadingTasks.length) + currentPercent / this.downloadingTasks.length
              this.total = this.current
            }
          )
          result = await this.audioDownloadPromise
          this.audioDownloadPromise = null
        }
      } catch (errorPath) {
        this.audioDownloadPromise = null
        this.event.$emit('alert', this.$t('home.errorTitle'), (this.$t('home.downloadFailed') as string) + '<br/>' + (errorPath as string))
        completeCount++
        continue
      }
      if (result) {
        this.current = (100 * completeCount / this.downloadingTasks.length) + (this.wavProgress ? 50 : 99.99) / this.downloadingTasks.length
        this.total = this.current
        if (type === 'wav') {
          await this.acb2wav(acbPath, audioFileName, (c, _t, _prog) => {
            const currentPercent = 50 + c * 100 / 2
            this.$set(audio, '_percent', currentPercent)
            this.current = (100 * completeCount / this.downloadingTasks.length) + currentPercent / this.downloadingTasks.length
            this.total = this.current
          })
        } else if (type === 'mp3') {
          await this.acb2mp3(acbPath, audioFileName, (_c, _t, prog) => {
            const currentPercent = 50 + prog.loading / 2
            this.$set(audio, '_percent', currentPercent)
            this.current = (100 * completeCount / this.downloadingTasks.length) + currentPercent / this.downloadingTasks.length
            this.total = this.current
          })
        } else if (type === 'aac') {
          await this.acb2aac(acbPath, audioFileName, (_c, _t, prog) => {
            const currentPercent = 50 + prog.loading / 2
            this.$set(audio, '_percent', currentPercent)
            this.current = (100 * completeCount / this.downloadingTasks.length) + currentPercent / this.downloadingTasks.length
            this.total = this.current
          })
        }
        this.$set(audio, '_canplay', true)
        await this.ensureScoreAndJacket(audio)
        this.text = ''
        completeCount++
      }
    }
    this.audioDownloading = false
    this.text = ''
    this.current = 0
    this.total = this.current
    this.downloadingTasks = []
  }

  async ensureScoreAndJacket (audio: BGM | Live): Promise<boolean> {
    if ('score' in audio) {
      if (!fs.existsSync(scoreDir(audio.score!))) {
        try {
          const scoreBdb = await this.scoreDownloader.downloadDatabase(
            audio.scoreHash!,
            scoreDir(audio.score!.split('.')[0])
          )
          if (scoreBdb) {
            // this.core.util.lz4dec(scoreBdb as string, 'bdb')
            fs.removeSync(scoreDir(audio.score!.split('.')[0]))
          } else {
            this.event.$emit('alert', this.$t('home.errorTitle'), 'Error!')
            return false
          }
        } catch (errorPath) {
          this.event.$emit('alert', this.$t('home.errorTitle'), (this.$t('home.downloadFailed') as string) + '<br/>' + (errorPath as string))
          return false
        }
      }
    }

    if ('jacket' in audio) {
      const name = path.parse(audio.jacket!).name
      const jacketlz4 = jacketDir(name)
      const pngName = name + '_m.png'
      const pngPath = jacketDir(pngName)
      if (!fs.existsSync(pngPath)) {
        try {
          const jacketu3d = await this.jacketDownloader.downloadAsset(
            audio.jacketHash!,
            jacketlz4
          )
          if (jacketu3d) {
            // this.core.util.lz4dec(scoreBdb as string, 'bdb')
            await fs.remove(jacketlz4)
            await unpackTexture2D(jacketu3d)
            await fs.remove(jacketDir(name + '_s.png'))
          } else {
            this.event.$emit('alert', this.$t('home.errorTitle'), 'Error!')
            return false
          }
        } catch (errorPath) {
          this.event.$emit('alert', this.$t('home.errorTitle'), (this.$t('home.downloadFailed') as string) + '<br/>' + (errorPath as string))
          return false
        }
      }
    }
    return true
  }

  formatJson (obj: any): string {
    try {
      return JSON.stringify(obj, null, 2)
    } catch (err) {
      return err.message
    }
  }

  selectAudioNew (audio: BGM | Live): void {
    this.playSe(this.enterSe)
    const index = this.selectedAudios.indexOf(audio)
    if (this.controlDown) {
      if (index !== -1) {
        this.selectedAudios.splice(index, 1)
        this.$set(audio, '_active', false)
      } else {
        this.selectedAudios.push(audio)
        this.$set(audio, '_active', true)
      }
      this.lastClickedAudio = audio
    } else if (this.shiftDown) {
      if (!this.lastClickedAudio) {
        this.lastClickedAudio = audio
        this.$set(audio, '_active', true)
        return
      }

      const lastClickedIndex = this.audioListData.indexOf(this.lastClickedAudio)
      if (lastClickedIndex !== -1) {
        const thisIndex = this.audioListData.indexOf(audio)
        let start: number
        let end: number
        if (lastClickedIndex < thisIndex) {
          start = lastClickedIndex
          end = thisIndex + 1
        } else {
          start = thisIndex
          end = lastClickedIndex + 1
        }
        this.selectedAudios.forEach(a => { this.$set(a, '_active', false) })
        this.selectedAudios.length = 0
        this.selectedAudios = this.audioListData.slice(start, end)
        this.selectedAudios.forEach(a => { this.$set(a, '_active', true) })
      } else {
        this.selectedAudios.push(audio)
        this.lastClickedAudio = audio
        this.$set(audio, '_active', true)
      }
    } else {
      this.selectedAudios.forEach(a => { this.$set(a, '_active', false) })
      this.selectedAudios.length = 0
      this.selectedAudios.push(audio)
      this.$set(audio, '_active', true)
      this.lastClickedAudio = audio
    }
  }

  async selectAudio (audio: BGM | Live): Promise<void> {
    // if (this.activeAudio.hash === audio.hash) return
    this.playSe(this.enterSe)
    const r = await this.ensureScoreAndJacket(audio)
    if (!r) return
    this.activeAudio = audio
    const audioType = audio.name.split('/')[0]
    const type = configurer.get('audioExport') ?? 'wav'
    const audioFileName = audio.fileName + '.' + type
    this.event.$emit('liveSelect', { src: getPath(`../asset/${audioType === 'b' ? 'bgm' : (audioType === 'l' ? 'live' : '')}/${audioFileName}`) })
    const activeAudio = this.activeAudio
    if ('score' in activeAudio) {
      this.allLyrics = await getLyrics(scoreDir(activeAudio.score!))
    } else {
      this.allLyrics = []
      this.lyrics = []
    }
    if ('jacket' in activeAudio) {
      const name = path.parse(activeAudio.jacket!).name
      // const jacketlz4 = jacketDir(name)
      const pngName = name + '_m.png'
      const pngPath = jacketDir(pngName)
      this.jacketSrc = path.posix.relative(getPath('renderer').replace(/\\/g, '/'), pngPath.replace(/\\/g, '/')).replace(/\\/g, '/')
    } else {
      this.jacketSrc = ''
    }
  }

  onAudioTypeChange (): void {
    this.selectedAudios.forEach(a => { this.$set(a, '_active', false) })
    this.selectedAudios.length = 0
    this.query(true)
  }

  query (quiet: boolean): void {
    if (!quiet) {
      this.playSe(this.enterSe)
    }
    if (this.queryString) {
      if (this.currentAudioType === 'BGM') {
        const arr = []
        const re = new RegExp(this.queryString)
        for (let i = 0; i < this.bgmManifest.length; i++) {
          if (re.test(this.bgmManifest[i].fileName)) {
            arr.push(this.bgmManifest[i])
          }
        }
        setAudioList(arr)
      } else if (this.currentAudioType === 'LIVE') {
        const arr = []
        const re = new RegExp(this.queryString)
        for (let i = 0; i < this.liveManifest.length; i++) {
          if (re.test(this.liveManifest[i].fileName)) {
            arr.push(this.liveManifest[i])
          }
        }
        setAudioList(arr)
      }
    } else {
      setAudioList(this.allAudioListData)
    }
    this.$nextTick(() => {
      if (this.$refs.audioList) {
        (this.$refs.audioList as HTMLDivElement).scrollTop = 0
      }
    })
  }

  opendir (): void {
    this.playSe(this.enterSe)
    const dirb = bgmDir()
    const dirl = liveDir()
    if (!fs.existsSync(dirb)) fs.mkdirsSync(dirb)
    if (!fs.existsSync(dirl)) fs.mkdirsSync(dirl)
    if (window.node.process.platform === 'win32') {
      shell.openExternal(dirb).catch(err => console.log(err))
      shell.openExternal(dirl).catch(err => console.log(err))
    } else {
      shell.showItemInFolder(dirb + '/.')
      shell.showItemInFolder(dirl + '/.')
    }
  }

  openLyrics (): void {
    const self = this
    let bodyhtml = this.allLyrics.map(line => line.lyrics).join('<br/>')
    if (this.jacketSrc) {
      bodyhtml = `<div style="text-align:center" ><img src="${this.jacketSrc}" /></div>${bodyhtml}`
    }
    const title = path.parse(this.activeAudio.fileName).name
    this.event.$emit('alert', title, bodyhtml, undefined, {
      text: this.$t('live.copy'),
      cb () {
        self.playSe(self.enterSe)
        clipboard.writeText(self.allLyrics.map(line => line.lyrics).join(os.EOL))
      }
    }, {
      text: this.$t('live.export'),
      cb: () => {
        self.playSe(self.enterSe)

        showSaveDialog({
          title: 'Save LRC - ' + title,
          defaultPath: getPath.scoreDir(title + '.lrc')
        }).then((res) => {
          if (res.filePath) {
            const lyricsArr = this.allLyrics.map(line => `[${filterTime(line.time, true)}]${line.lyrics}`)
            lyricsArr.unshift('[by:mishiro]')
            lyricsArr.push('')
            const lrcstr = lyricsArr.join(os.EOL)
            const data = iconvLite.encode(lrcstr, configurer.get('lrcEncoding') || 'utf8')
            fs.writeFileSync(res.filePath, data)
          }
        }).catch((err: any) => {
          console.log(err)
        })
      }
    })
  }

  private async gameOrScore (): Promise<boolean> {
    if (this.isGameRunning) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('live.gameRunning'))
      return false
    }

    const activeAudio = this.activeAudio as Live
    if (!activeAudio.score) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('live.noScore'))
      return false
    }

    const type = configurer.get('audioExport') ?? 'wav'
    if (!fs.existsSync(liveDir(activeAudio.fileName + '.' + type))) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('live.noAudio'))
      return false
    }

    if (!fs.existsSync(scoreDir(activeAudio.score))) {
      try {
        // let scoreBdb = await this.scoreDownloader.downloadOne(
        //   this.getDbUrl(activeAudio.scoreHash),
        //   scoreDir(activeAudio.score.split('.')[0])
        // )
        const scoreBdb = await this.scoreDownloader.downloadDatabase(
          activeAudio.scoreHash!,
          scoreDir(activeAudio.score.split('.')[0])
        )
        if (scoreBdb) {
          // this.core.util.lz4dec(scoreBdb as string, 'bdb')
          fs.removeSync(scoreDir(activeAudio.score.split('.')[0]))
        } else {
          this.event.$emit('alert', this.$t('home.errorTitle'), 'Error!')
          return false
        }
      } catch (errorPath) {
        this.event.$emit('alert', this.$t('home.errorTitle'), (this.$t('home.downloadFailed') as string) + '<br/>' + (errorPath as string))
        return false
      }
    }

    return true
  }

  // async startGame () {
  //   this.playSe(this.enterSe)
  //   const result = await this.gameOrScore()
  //   if (result) this.event.$emit('game', this.activeAudio)
  // }

  async startScore (): Promise<void> {
    this.playSe(this.enterSe)
    const result = await this.gameOrScore()
    if (!result) return
    const difficulties = await getScoreDifficulties(scoreDir((this.activeAudio as Live).score!))
    this.event.$emit('score', this.activeAudio, difficulties)
  }

  // private checkScore (scoreFile: string) {
  //   const id = generateObjectId()
  //   return new Promise<boolean>((resolve) => {
  //     ipcRenderer.once(id, (_e: Event, hasMasterPlus: boolean) => {
  //       resolve(hasMasterPlus)
  //     })
  //     ipcRenderer.send('checkScore', id, scoreFile)
  //   })
  // }

  get allAudioListData (): BGM[] | Live[] {
    if (this.currentAudioType === 'BGM') {
      return this.bgmManifest
    } else if (this.currentAudioType === 'LIVE') {
      return this.liveManifest
    }
    return []
  }

  mounted (): void {
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
        this.jacketSrc = ''
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
          this.query(false)
        }
      })
      ipcRenderer.on('liveEnd', (_event: Event, liveResult: any, isCompleted: boolean) => {
        this.isGameRunning = false
        if (isCompleted) this.playSe(new Audio('../../asset/se.asar/se_live_wow.mp3'))
        if (liveResult) this.event.$emit('showLiveResult', liveResult)
        else this.event.$emit('playBgm')
      })
      // ipcRenderer.on('lyrics', (_event: Event, lyrics: { time: number; lyrics: string; size: any }[]) => {
      //   this.allLyrics = lyrics
      // })
      document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Control') {
          this.controlDown = true
        } else if (e.key === 'Shift') {
          this.shiftDown = true
        }
      })
      document.addEventListener('keyup', (e: KeyboardEvent) => {
        if (e.key === 'Control') {
          this.controlDown = false
        } else if (e.key === 'Shift') {
          this.shiftDown = false
        }
      })
    })
  }
}
