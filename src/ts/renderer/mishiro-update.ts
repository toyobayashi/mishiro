import * as fs from 'fs'
import * as path from 'path'
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { ProgressInfo } from '../common/request'
import { MasterData } from '../main/on-master-read'
import ProgressBar from '../../vue/component/ProgressBar.vue'
import check from './check'
import Downloader from './downloader'
import { ipcRenderer, remote, Event } from 'electron'
import getPath from '../common/get-path'
import MishiroIdol from './mishiro-idol'
import ThePlayer from './the-player'

const downloadMaster = (resVer: number, hash: string, progressing: (prog: ProgressInfo) => void) => new Downloader().download(
  `http://storage.game.starlight-stage.jp/dl/resources/Generic/${hash}`,
  getPath(`./data/master_${resVer}`),
  progressing
)

const downloadManifest = (resVer: number, progressing: (prog: ProgressInfo) => void) => new Downloader().download(
  `http://storage.game.starlight-stage.jp/dl/${resVer}/manifests/Android_AHigh_SHigh`,
  getPath(`./data/manifest_${resVer}`),
  progressing
)

@Component({
  components: {
    ProgressBar
  }
})
export default class extends Vue {

  loading: number = 0
  isReady: boolean = false
  text: string = ''
  appData: { resVer: number | string; latestResVer: number | string; master: MasterData | any} = {
    resVer: 'Unknown',
    latestResVer: 'Unknown',
    master: {}
  }

  @Prop() value!: any
  @Prop() isTouched!: boolean

  getEventCardId (eventAvailable: any[]): number[] {
    eventAvailable.sort(function (a, b) {
      return a.recommend_order - b.recommend_order
    })
    return [eventAvailable[0].reward_id, eventAvailable[eventAvailable.length - 1].reward_id]
  }

  @Emit('ready')
  emitReady () {
    this.event.$emit('ready')
  }

  async getResVer () {
    let resVer = await check((prog: ProgressInfo) => { // 检查资源版本，回调更新进度条
      this.text = (this.$t('update.check') as string) + prog.current + ' / ' + prog.max
      this.loading = prog.loading
    })
    return resVer
  }
  async getManifest (resVer: number) {
    this.loading = 0
    this.text = this.$t('update.manifest') as string

    let manifestFile = ''
    if (fs.existsSync(getPath(`./data/manifest_${resVer}.db`))) {
      this.loading = 100
      manifestFile = getPath(`./data/manifest_${resVer}.db`)
      return manifestFile
    }
    try {
      const manifestLz4File = await downloadManifest(resVer, (prog: ProgressInfo) => {
        this.text = (this.$t('update.manifest') as string) + Math.ceil(prog.current / 1024) + '/' + Math.ceil(prog.max / 1024) + ' KB'
        this.loading = prog.loading
      })
      if (manifestLz4File) {
        manifestFile = this.lz4dec(manifestLz4File as string, 'db')
        fs.unlinkSync(getPath(`./data/manifest_${resVer}`))
        return manifestFile
      } else throw new Error('Download failed.')
    } catch (errorPath) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
      return false
    }
  }
  async getMaster (resVer: number, masterHash: string) {
    this.loading = 0
    this.text = this.$t('update.master') as string

    let masterFile = ''
    if (fs.existsSync(getPath(`./data/master_${resVer}.db`))) {
      this.loading = 100
      masterFile = getPath(`./data/master_${resVer}.db`)
      return masterFile
    }
    try {
      const masterLz4File = await downloadMaster(resVer, masterHash, (prog: ProgressInfo) => {
        this.text = (this.$t('update.master') as string) + Math.ceil(prog.current / 1024) + '/' + Math.ceil(prog.max / 1024) + ' KB'
        this.loading = prog.loading
      })
      if (masterLz4File) {
        masterFile = this.lz4dec(masterLz4File as string, 'db')
        fs.unlinkSync(getPath(`./data/master_${resVer}`))
        return masterFile
      } else throw new Error('Download failed.')
    } catch (errorPath) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
      return false
    }
  }

  sleep (ms: number): Promise<undefined> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }

  mounted () {
    this.$nextTick(() => {
      this.text = this.$t('update.check') as string
      this.event.$on('enter', async () => { // 已从入口进入
        if (!fs.existsSync(getPath('./public/asset/sound/bgm'))) {
          fs.mkdirSync(getPath('./public/asset/sound/bgm'))
        }
        if (!fs.existsSync(getPath('./public/asset/sound/live'))) {
          fs.mkdirSync(getPath('./public/asset/sound/live'))
        }
        if (!fs.existsSync(getPath('./public/asset/sound/voice'))) {
          fs.mkdirSync(getPath('./public/asset/sound/voice'))
        }
        if (!fs.existsSync(getPath('./public/asset/score'))) {
          fs.mkdirSync(getPath('./public/asset/score'))
        }
        ipcRenderer.on('readManifest', async (_event: Event, masterHash: string, resVer: number) => {
          const masterFile = await this.getMaster(resVer, masterHash)
          if (masterFile) ipcRenderer.send('readMaster', masterFile)
        })
        ipcRenderer.on('readMaster', async (_event: Event, masterData: MasterData) => {
          // console.log(masterData);
          let config = this.configurer.getConfigSync()
          const bgmList = new ThePlayer().bgmList
          const downloader = new Downloader()
          const toName = (p: string) => path.parse(p).name
          this.appData.master = masterData
          this.appData.latestResVer = config.latestResVer
          this.$emit('input', this.appData)

          const bgmManifest = masterData.bgmManifest
          for (let k in bgmList) {
            if (!fs.existsSync(path.join(getPath('./public'), bgmList[k].src))) {
              let acbName = `b/${toName(bgmList[k].src)}.acb`
              let hash: string = bgmManifest.filter(row => row.name === acbName)[0].hash
              try {
                let result = await downloader.download(
                  this.getBgmUrl(hash),
                  getPath(`./public/asset/sound/bgm/${toName(bgmList[k].src)}.acb`),
                  (prog: ProgressInfo) => {
                    this.text = prog.name + '　' + Math.ceil(prog.current / 1024) + '/' + Math.ceil(prog.max / 1024) + ' KB'
                    this.loading = prog.loading
                  }
                )
                if (result) {
                  ipcRenderer.send('acb', getPath(`./public/asset/sound/bgm/${toName(bgmList[k].src)}.acb`))
                  await this.sleep(5000)
                }
              } catch (errorPath) {
                this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
              }
            }
          }
          if (masterData.eventHappening) {
            if (Number(masterData.eventData.type) !== 2 && Number(masterData.eventData.type) !== 6 && !fs.existsSync(getPath(`./public/asset/sound/bgm/bgm_event_${masterData.eventData.id}.mp3`))) {
              const eventBgmHash = bgmManifest.filter(row => row.name === `b/bgm_event_${masterData.eventData.id}.acb`)[0].hash
              try {
                let result = await downloader.download(
                  this.getBgmUrl(eventBgmHash),
                  getPath(`./public/asset/sound/bgm/bgm_event_${masterData.eventData.id}.acb`),
                  (prog: ProgressInfo) => {
                    this.text = prog.name + '　' + Math.ceil(prog.current / 1024) + '/' + Math.ceil(prog.max / 1024) + ' KB'
                    this.loading = prog.loading
                  }
                )
                if (result) {
                  ipcRenderer.send('acb', getPath(`./public/asset/sound/bgm/bgm_event_${masterData.eventData.id}.acb`))
                  await this.sleep(2000)
                }
              } catch (errorPath) {
                this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
              }
            }
          }

          if (!fs.existsSync(getPath('./public/img/card'))) {
            fs.mkdirSync(getPath('./public/img/card'))
          }

          const eventAvailable = masterData.eventAvailable
          const cardId = this.getEventCardId(eventAvailable)

          if (masterData.eventHappening) {
            localStorage.setItem('msrEvent', `{"id":${masterData.eventData.id},"card":${Number(cardId[0]) + 1}}`)
          } else {
            localStorage.removeItem('msrEvent')
          }

          if (config.background) {
            let result = await new MishiroIdol().downloadCard.call(this, config.background, (prog: ProgressInfo) => {
              this.text = prog.name || ''
              this.loading = prog.loading
            })
            if (result) {
              this.event.$emit('eventBgReady', config.background)
            }
          } else {
            // const cardIdEvolution = [(Number(cardId[0]) + 1), (Number(cardId[1]) + 1)];
            if (masterData.eventHappening) {
              let result = await new MishiroIdol().downloadCard.call(this, Number(cardId[0]) + 1, (prog: ProgressInfo) => {
                this.text = prog.name || ''
                this.loading = prog.loading
              })
              if (result) {
                this.event.$emit('eventBgReady', Number(cardId[0]) + 1)
              }
            }
          }
          if (masterData.eventHappening) this.event.$emit('eventRewardCard', cardId)

          if (!fs.existsSync(getPath('./public/img/icon'))) {
            fs.mkdirSync(getPath('./public/img/icon'))
          }
          let iconId = []
          for (let index = 0; index < masterData.gachaAvailable.length; index++) {
            iconId.push(masterData.gachaAvailable[index].reward_id)
          }
          const iconTask = this.createCardIconTask(iconId)
          await downloader.batchDl(iconTask, (name: string) => {
            this.text = name + '　' + downloader.index + '/' + iconTask.length
            this.loading = 100 * downloader.index / iconTask.length
          }, (prog: ProgressInfo) => {
            this.loading = 100 * downloader.index / iconTask.length + prog.loading / iconTask.length
          })
          // console.log(failedList)
          this.emitReady()
        })
        if (navigator.onLine) { // 判断网络是否连接
          const resVer = await this.getResVer()
          this.appData.resVer = Number(resVer)
          this.$emit('input', this.appData)
          const manifestFile = await this.getManifest(resVer)
          if (manifestFile) ipcRenderer.send('readManifest', manifestFile, resVer)
        } else { // 如果网络未连接则直接触发ready事件
          let resVer = remote.getGlobal('config').latestResVer
          this.appData.resVer = Number(resVer)
          this.$emit('input', this.appData)
          if (fs.existsSync(getPath(`./data/manifest_${resVer}.db`)) && fs.existsSync(getPath(`./data/master_${resVer}.db`))) {
            let manifestFile = getPath(`./data/manifest_${resVer}.db`)
            if (manifestFile) ipcRenderer.send('readManifest', manifestFile, resVer)
          } else {
            this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noNetwork'))
          }
        }
      })
    })
  }
}
