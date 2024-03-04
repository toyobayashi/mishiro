import type { Event } from 'electron'
import { Vue, Component } from 'vue-property-decorator'

import TabSmall from '../../vue/component/TabSmall.vue'

import TaskLoading from '../../vue/component/TaskLoading.vue'
import InputText from '../../vue/component/InputText.vue'
import { unpackTexture2D } from './unpack-texture-2d'
// import { generateObjectId } from '../common/object-id'

// import { MasterData } from '../main/on-master-read'

import getPath from '../common/get-path'
import { getLyrics, getScoreDifficulties, showOpenDialog, showSaveDialog } from './ipc'
import type { DownloadPromise } from 'mishiro-core'
import configurer from './config'
import type { MishiroConfig } from '../main/config'
import type { Live, BGM } from './back/resolve-audio-manifest'
import { setAudioList } from './store'
import { readAcb } from './audio'
import { error } from './log'

const fs = window.node.fs
const path = window.node.path
const os = window.node.os
const iconvLite = window.node.iconvLite
const { shell, ipcRenderer, clipboard } = window.node.electron
const { scoreDir, bgmDir, bgmAsarDir, liveDir, jacketDir } = getPath

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
  playVolume: number = this.bgm.volume * 100
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
  audioExporting = false

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

  onVolumeChange (event: InputEvent): void {
    const value = Number((event.target as HTMLInputElement).value)
    if (Number.isNaN(value)) return
    this.bgm.volume = value / 100
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

  async exportSelectedItem (): Promise<void> {
    this.playSe(this.enterSe)

    const exportTasks = this.selectedAudios.slice(0)
    if (exportTasks.length <= 0) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noEmptyDownload'))
      return
    }
    for (let i = 0; i < exportTasks.length; i++) {
      if (!exportTasks[i]._canplay) {
        this.event.$emit('alert', this.$t('home.errorTitle'), `Not exists: ${exportTasks[i].fileName}`)
        return
      }
    }

    const result = await showOpenDialog({
      title: this.$t('live.exportDir') as string,
      defaultPath: bgmDir('..'),
      properties: [
        'openDirectory',
        'createDirectory',
        'promptToCreate',
        'treatPackageAsDirectory',
        'showHiddenFiles',
        'dontAddToRecent'
      ]
    })

    if (result.canceled) return

    this.audioExporting = true
    let completeCount = 0

    const targetDir = result.filePaths[0]
    fs.mkdirsSync(targetDir)
    const loopCount = configurer.get('loopCount') || 0
    for (let i = 0; i < exportTasks.length; i++) {
      const audio = exportTasks[i]
      const audioType = audio.name.split('/')[0]

      const type = configurer.get('audioExport') ?? 'wav'
      const audioFileName = audio.fileName + '.' + type
      const hcaFileName = audio.fileName + '.hca'
      const wavFileName = audio.fileName + '.wav'

      const dir = audioType === 'b' ? bgmDir : (audioType === 'l' ? liveDir : null)
      if (!dir) {
        error('LIVE AUDIO EXPORT: Unknown audio type')
        completeCount++
        continue
      }
      let hcaFilePath = dir(hcaFileName)
      const wavFilePath = path.join(targetDir, wavFileName)
      const audioFilePath = path.join(targetDir, audioFileName)
      let hcaInAsar = false

      let hcaFilePathExist = fs.existsSync(hcaFilePath)
      if (audioType === 'b' && !hcaFilePathExist) {
        const asarHcaFilePath = bgmAsarDir(hcaFileName)
        if (fs.existsSync(asarHcaFilePath)) {
          hcaFilePathExist = true
          hcaFilePath = asarHcaFilePath
          hcaInAsar = true
        }
      }

      this.text = `[${completeCount}/${exportTasks.length}] ${audioFileName}`
      this.current = (100 * completeCount / exportTasks.length)
      this.total = this.current
      try {
        if (type === 'wav') {
          await window.node.mishiroCore.audio.hca2wav(hcaInAsar ? fs.readFileSync(hcaFilePath) : hcaFilePath, wavFilePath, loopCount)
        } else if (type === 'mp3') {
          const tmpwavPath = path.join(os.tmpdir(), wavFileName)
          await window.node.mishiroCore.audio.hca2wav(hcaInAsar ? fs.readFileSync(hcaFilePath) : hcaFilePath, tmpwavPath, loopCount)
          await window.node.mishiroCore.audio.wav2mp3(tmpwavPath, audioFilePath, (prog) => {
            const currentPercent = prog.loading
            this.$set(audio, '_percent', currentPercent)
            this.current = (100 * completeCount / exportTasks.length) + currentPercent / exportTasks.length
            this.total = this.current
          })
          await fs.remove(tmpwavPath)
        } else if (type === 'aac') {
          const tmpwavPath = path.join(os.tmpdir(), wavFileName)
          await window.node.mishiroCore.audio.hca2wav(hcaInAsar ? fs.readFileSync(hcaFilePath) : hcaFilePath, tmpwavPath, loopCount)
          await window.node.mishiroCore.audio.wav2aac(tmpwavPath, audioFilePath, (prog) => {
            const currentPercent = prog.loading
            this.$set(audio, '_percent', currentPercent)
            this.current = (100 * completeCount / exportTasks.length) + currentPercent / exportTasks.length
            this.total = this.current
          })
          await fs.remove(tmpwavPath)
        }
      } catch (err: any) {
        error(`LIVE AUDIO EXPORT: ${err.stack}`)
      }
      this.text = ''
      completeCount++
    }
    this.text = ''
    this.current = 0
    this.total = this.current
    this.audioExporting = false
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
      const acbPathObj = path.posix.parse(audio.name)
      const acbBase = acbPathObj.base
      const awbBase = acbPathObj.name + '.awb'
      const hcaFileName = audio.fileName + '.hca'
      const needAwb = !!audio.awbHash

      const dir = audioType === 'b' ? bgmDir : (audioType === 'l' ? liveDir : null)
      if (!dir) {
        error('LIVE AUDIO DOWNLOAD: Unknown audio type')
        completeCount++
        continue
      }
      let hcaFilePath = dir(hcaFileName)
      // let hcaInAsar = false

      let hcaFilePathExist = fs.existsSync(hcaFilePath)
      if (audioType === 'b' && !hcaFilePathExist) {
        const asarHcaFilePath = bgmAsarDir(hcaFileName)
        if (fs.existsSync(asarHcaFilePath)) {
          hcaFilePathExist = true
          hcaFilePath = asarHcaFilePath
          // hcaInAsar = true
        }
      }

      if (hcaFilePathExist) {
        completeCount++
        continue
      }

      this.text = `[${completeCount}/${this.downloadingTasks.length}] ${path.basename(audio.name)}`
      const acbPath = dir(acbBase)
      if (!hcaFilePathExist) {
        let result: string
        const awbPath = dir(awbBase)
        try {
          this.audioDownloadPromise = this.dler.downloadSound(
            audioType,
            audio.hash,
            acbPath,
            (prog) => {
              this.text = `[${completeCount}/${this.downloadingTasks.length}] ${prog.name as string}`
              if (!needAwb) {
                const currentPercent = prog.loading
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
              awbPath,
              (prog) => {
                this.text = `[${completeCount}/${this.downloadingTasks.length}] ${prog.name as string}`
                const currentPercent = prog.loading
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
        if (!result) {
          completeCount++
          continue
        }
        const acbEntries = readAcb(acbPath)
        if (acbEntries.length === 0) {
          completeCount++
          continue
        }
        await fs.promises.writeFile(hcaFilePath, acbEntries[0].buffer)
        await fs.remove(acbPath)
        if (needAwb) await fs.remove(awbPath)
      }
      this.$set(audio, '_canplay', true)

      await this.ensureScoreAndJacket(audio)
      this.text = ''
      completeCount++
    }
    this.audioDownloading = false
    this.text = ''
    this.current = 0
    this.total = this.current
    this.downloadingTasks = []
  }

  async ensureScoreAndJacket (audio: BGM | Live): Promise<{
    score: boolean
    jacket: boolean
  }> {
    const r = {
      score: false,
      jacket: false
    }
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
            this.event.$emit('alert', this.$t('home.errorTitle'), 'Score database download failed')
            return r
          }
        } catch (errorPath) {
          this.event.$emit('alert', this.$t('home.errorTitle'), (this.$t('home.downloadFailed') as string) + '<br/>' + (errorPath as string))
          return r
        }
      }
      r.score = true
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
            this.event.$emit('alert', this.$t('home.errorTitle'), 'Jacket download failed')
            return r
          }
        } catch (errorPath: any) {
          const err: string = typeof errorPath === 'string' ? errorPath : errorPath.message
          this.event.$emit('alert', this.$t('home.errorTitle'), (this.$t('home.downloadFailed') as string) + '<br/>' + err)
          return r
        }
      }
      r.jacket = true
    }
    return r
  }

  formatJson (obj: any): string {
    try {
      return JSON.stringify(obj, null, 2)
    } catch (err: any) {
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
    if (this.activeAudio.hash === audio.hash) return
    this.playSe(this.enterSe)
    this.activeAudio = audio
    const audioType = audio.name.split('/')[0]
    const hcaFileName = audio.fileName + '.hca'
    const dir = audioType === 'b' ? bgmDir : (audioType === 'l' ? liveDir : null)
    if (!dir) {
      this.event.$emit('alert', this.$t('home.errorTitle'), 'Unknown audio type')
      return
    }
    let hcaFilePath = dir(hcaFileName)
    // let hcaInAsar = false

    let hcaFilePathExist = fs.existsSync(hcaFilePath)
    if (audioType === 'b' && !hcaFilePathExist) {
      const asarHcaFilePath = bgmAsarDir(hcaFileName)
      if (fs.existsSync(asarHcaFilePath)) {
        hcaFilePathExist = true
        hcaFilePath = asarHcaFilePath
        // hcaInAsar = true
      }
    }
    if (!hcaFilePathExist) {
      this.$set(audio, '_canplay', false)
      return
    }

    this.event.$emit('liveSelect', { src: hcaFilePath })
    this.jacketSrc = ''
    const r = await this.ensureScoreAndJacket(audio)
    if (r.score) {
      this.allLyrics = await getLyrics(scoreDir((audio as Live).score!))
    } else {
      this.allLyrics = []
      this.lyrics = []
    }
    if (r.jacket) {
      const name = path.parse((audio as Live).jacket!).name
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
        if (this.queryString === '/ok') {
          for (let i = 0; i < this.bgmManifest.length; i++) {
            if (this.bgmManifest[i]._canplay) {
              arr.push(this.bgmManifest[i])
            }
          }
        } else {
          const re = new RegExp(this.queryString)
          for (let i = 0; i < this.bgmManifest.length; i++) {
            if (re.test(this.bgmManifest[i].fileName)) {
              arr.push(this.bgmManifest[i])
            }
          }
        }
        setAudioList(arr)
      } else if (this.currentAudioType === 'LIVE') {
        const arr = []
        if (this.queryString === '/ok') {
          for (let i = 0; i < this.liveManifest.length; i++) {
            if (this.liveManifest[i]._canplay) {
              arr.push(this.liveManifest[i])
            }
          }
        } else {
          const re = new RegExp(this.queryString)
          for (let i = 0; i < this.liveManifest.length; i++) {
            if (re.test(this.liveManifest[i].fileName)) {
              arr.push(this.liveManifest[i])
            }
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
      shell.openExternal(dirb).catch(err => {
        console.error(err)
        error(`LIVE opendir: ${err.stack}`)
      })
      shell.openExternal(dirl).catch(err => {
        console.error(err)
        error(`LIVE opendir: ${err.stack}`)
      })
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
        }).catch((err) => {
          console.error(err)
          error(`LIVE openLyrics: ${err.stack}`)
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

    if (!fs.existsSync(liveDir(activeAudio.fileName + '.hca'))) {
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
          this.event.$emit('alert', this.$t('home.errorTitle'), 'Score database download failed')
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
      this.bgm.on('volumechange', () => {
        this.playVolume = this.bgm.volume * 100
      })
      this.bgm.on('timeupdate', () => {
        this.currentTime = this.bgm.currentTime
        for (let i = this.allLyrics.length - 1; i >= 0; i--) {
          const line = this.allLyrics[i]
          if (this.bgm.currentTime >= line.time) {
            this.lyrics = i === this.allLyrics.length - 1 ? [this.allLyrics[i]] : [this.allLyrics[i], this.allLyrics[i + 1]]
            break
          }
        }
      })
      this.bgm.on('durationchange', () => {
        this.duration = this.bgm.duration
      })
      this.event.$on('playerSelect', (fileName: string) => {
        if (this.bgmManifest.filter(bgm => bgm.fileName === fileName).length > 0) {
          this.allLyrics = []
          this.lyrics = []
          this.jacketSrc = ''
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
