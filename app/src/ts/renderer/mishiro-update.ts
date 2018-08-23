import fs from './fs-extra'
import * as path from 'path'
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { ProgressInfo } from 'mishiro-core'
import { MasterData } from '../main/on-master-read'
import ProgressBar from '../../vue/component/ProgressBar.vue'
import check from './check'

import { ipcRenderer, Event } from 'electron'
import getPath, { manifestPath, masterPath, bgmDir, iconDir } from '../common/get-path'
import MishiroIdol from './mishiro-idol'
import ThePlayer from './the-player'
import { unpackTexture2D } from './win'

@Component({
  components: {
    ProgressBar
  }
})
export default class extends Vue {
  dler = new this.core.Downloader()
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

  getEventCardId (eventAvailable: any[], eventData: any): number[] {
    if (!eventAvailable.length) return [Number(eventData.bg_id) - 1]
    eventAvailable.sort(function (a, b) {
      return a.recommend_order - b.recommend_order
    })
    // console.log(eventAvailable)
    return [eventAvailable[0].reward_id, eventAvailable[eventAvailable.length - 1].reward_id]
  }

  @Emit('ready')
  emitReady () {
    this.event.$emit('ready')
  }

  async getResVer () {
    let resVer = await check(prog => { // 检查资源版本，回调更新进度条
      this.text = (this.$t('update.check') as string) + prog.current + ' / ' + prog.max
      this.loading = prog.loading
    })
    return resVer
  }
  async getManifest (resVer: number) {
    this.loading = 0
    this.text = this.$t('update.manifest') as string

    let manifestFile = ''
    if (fs.existsSync(manifestPath(resVer, '.db'))) {
      this.loading = 100
      manifestFile = manifestPath(resVer, '.db')
      return manifestFile
    }
    try {
      const manifestFile = await this.dler.downloadManifest(resVer, manifestPath(resVer), prog => {
        this.text = (this.$t('update.manifest') as string) + Math.ceil(prog.current / 1024) + '/' + Math.ceil(prog.max / 1024) + ' KB'
        this.loading = prog.loading
      })
      if (manifestFile) {
        fs.unlinkSync(manifestPath(resVer))
        return manifestFile
      } else throw new Error('Download failed.')
    } catch (errorPath) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
      return false
    }
  }

  downloadMaster (resVer: number, hash: string, progressing: (prog: ProgressInfo) => void) {
    let downloader = new this.core.Downloader()
    return downloader.downloadOne(
      `http://storage.game.starlight-stage.jp/dl/resources/Generic/${hash}`,
      masterPath(resVer),
      progressing
    )
  }

  async getMaster (resVer: number, masterHash: string) {
    this.loading = 0
    this.text = this.$t('update.master') as string

    let masterFile = ''
    if (fs.existsSync(masterPath(resVer, '.db'))) {
      this.loading = 100
      masterFile = masterPath(resVer, '.db')
      return masterFile
    }
    try {
      const masterLz4File = await this.downloadMaster(resVer, masterHash, prog => {
        this.text = (this.$t('update.master') as string) + Math.ceil(prog.current / 1024) + '/' + Math.ceil(prog.max / 1024) + ' KB'
        this.loading = prog.loading
      })
      if (masterLz4File) {
        masterFile = this.core.util.lz4dec(masterLz4File as string, '.db')
        fs.unlinkSync(masterLz4File)
        return masterFile
      } else throw new Error('Download failed.')
    } catch (errorPath) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
      return false
    }
  }

  // sleep (ms: number): Promise<undefined> {
  //   return new Promise(resolve => {
  //     setTimeout(() => {
  //       resolve()
  //     }, ms)
  //   })
  // }

  getGachaIcon (icons: { name: string; hash: string; [x: string]: any }[]) {
    return new Promise(async (resolve, _reject) => {
      for (let i = 0; i < icons.length; i++) {
        let cacheName = iconDir(path.parse(icons[i].name).name)
        this.text = icons[i].name + '　' + i + '/' + icons.length
        this.loading = 100 * i / icons.length
        if (!fs.existsSync(cacheName + '.png')) {
          try {
            let asset = await this.dler.downloadAsset(icons[i].hash, cacheName)
            if (asset) {
              fs.removeSync(cacheName)
              await unpackTexture2D(asset)
            }
          } catch (err) {
            console.log(err)
            continue
          }
        }
      }
      resolve()
    })
  }

  mounted () {
    this.$nextTick(() => {
      this.text = this.$t('update.check') as string
      this.event.$on('enter', async ($resver?: number) => { // 已从入口进入
        ipcRenderer.on('readManifest', async (_event: Event, masterHash: string, resVer: number) => {
          const masterFile = await this.getMaster(resVer, masterHash)
          if (masterFile) ipcRenderer.send('readMaster', masterFile, resVer)
        })
        ipcRenderer.on('readMaster', async (_event: Event, masterData: MasterData) => {
          // console.log(masterData);
          let config = this.configurer.getConfig()
          const bgmList = new ThePlayer().bgmList
          const downloader = new this.core.Downloader()
          const toName = (p: string) => path.parse(p).name
          this.appData.master = masterData
          this.appData.latestResVer = config.latestResVer as number
          this.$emit('input', this.appData)

          const bgmManifest = masterData.bgmManifest
          for (let k in bgmList) {
            if (!fs.existsSync(path.join(getPath('./public'), bgmList[k].src))) {
              let acbName = `b/${toName(bgmList[k].src)}.acb`
              let hash: string = bgmManifest.filter(row => row.name === acbName)[0].hash
              try {
                // let result = await downloader.downloadOne(
                //   this.getBgmUrl(hash),
                //   bgmDir(`${toName(bgmList[k].src)}.acb`),
                //   (prog: ProgressInfo) => {
                //     this.text = prog.name + '　' + Math.ceil(prog.current / 1024) + '/' + Math.ceil(prog.max / 1024) + ' KB'
                //     this.loading = prog.loading
                //   }
                // )
                let result = await downloader.downloadSound(
                  'b',
                  hash,
                  bgmDir(`${toName(bgmList[k].src)}.acb`),
                  prog => {
                    this.text = prog.name + '　' + Math.ceil(prog.current / 1024) + '/' + Math.ceil(prog.max / 1024) + ' KB'
                    this.loading = prog.loading
                  }
                )
                if (result) {
                  await this.acb2mp3(bgmDir(`${toName(bgmList[k].src)}.acb`))
                }
              } catch (errorPath) {
                this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
              }
            }
          }
          if (masterData.eventHappening) {
            if (Number(masterData.eventData.type) !== 2 && Number(masterData.eventData.type) !== 6 && !fs.existsSync(bgmDir(`bgm_event_${masterData.eventData.id}.mp3`))) {
              const eventBgmHash = bgmManifest.filter(row => row.name === `b/bgm_event_${masterData.eventData.id}.acb`)[0].hash
              try {
                // let result = await downloader.download(
                //   this.getBgmUrl(eventBgmHash),
                //   bgmDir(`bgm_event_${masterData.eventData.id}.acb`),
                //   (prog: ProgressInfo) => {
                //     this.text = prog.name + '　' + Math.ceil(prog.current / 1024) + '/' + Math.ceil(prog.max / 1024) + ' KB'
                //     this.loading = prog.loading
                //   }
                // )
                let result = await downloader.downloadSound(
                  'b',
                  eventBgmHash,
                  bgmDir(`bgm_event_${masterData.eventData.id}.acb`),
                  prog => {
                    this.text = prog.name + '　' + Math.ceil(prog.current / 1024) + '/' + Math.ceil(prog.max / 1024) + ' KB'
                    this.loading = prog.loading
                  }
                )
                if (result) {
                  await this.acb2mp3(bgmDir(`bgm_event_${masterData.eventData.id}.acb`))
                }
              } catch (errorPath) {
                this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
              }
            }
          }

          const cardId = this.getEventCardId(masterData.eventAvailable, masterData.eventData)

          if (masterData.eventHappening) {
            localStorage.setItem('msrEvent', `{"id":${masterData.eventData.id},"card":${Number(cardId[0]) + 1}}`)
          } else {
            localStorage.removeItem('msrEvent')
          }

          let downloadCard = new MishiroIdol().downloadCard

          // const tmpawait = () => new Promise((resolve) => {
          //   this.event.$once('_eventBgReady', () => {
          //     resolve()
          //   })
          // })

          let getBackgroundResult: string = ''

          const getBackground = async (id: string | number) => {
            try {
              getBackgroundResult = await downloadCard.call(this, id, 'eventBgReady', (prog: ProgressInfo) => {
                this.text = prog.name || ''
                this.loading = prog.loading
              })

              this.loading = 99.99
              if (getBackgroundResult/*  && getBackgroundResult !== 'await ipc' */) {
                this.event.$emit('eventBgReady', id)
              }
            } catch (err) {
              this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + err)
            }
          }

          if (config.background) {
            await getBackground(config.background)
          } else {
            // const cardIdEvolution = [(Number(cardId[0]) + 1), (Number(cardId[1]) + 1)];
            if (masterData.eventHappening) {
              await getBackground(Number(cardId[0]) + 1)
            }
          }

          // if (getBackgroundResult === 'await ipc') await tmpawait()

          if (masterData.eventHappening) this.event.$emit('eventRewardCard', cardId)

          /* let iconId = []
          for (let index = 0; index < masterData.gachaAvailable.length; index++) {
            iconId.push(masterData.gachaAvailable[index].reward_id)
          }
          const iconTask = this.createCardIconTask(iconId)
          await downloader.download(iconTask, ([_url, filepath]) => {
            const name = path.basename(filepath)
            this.text = name + '　' + downloader.index + '/' + iconTask.length
            this.loading = 100 * downloader.index / iconTask.length
          }, prog => {
            this.loading = 100 * downloader.index / iconTask.length + prog.loading / iconTask.length
          }) */

          await this.getGachaIcon(masterData.gachaIcon)
          // console.log(failedList)
          this.emitReady()
        })
        if (navigator.onLine) { // 判断网络是否连接
          let resVer: number
          try {
            resVer = $resver || await this.getResVer()
          } catch (err) {
            console.log(err)
            resVer = this.configurer.getConfig().latestResVer as number
          }

          this.appData.resVer = Number(resVer)
          this.$emit('input', this.appData)
          const manifestFile = await this.getManifest(resVer)
          if (manifestFile) ipcRenderer.send('readManifest', manifestFile, resVer)
        } else { // 如果网络未连接则直接触发ready事件
          let resVer = this.configurer.getConfig().latestResVer as number
          this.appData.resVer = Number(resVer)
          this.$emit('input', this.appData)
          if (fs.existsSync(manifestPath(resVer, '.db')) && fs.existsSync(masterPath(resVer, '.db'))) {
            let manifestFile = manifestPath(resVer, '.db')
            if (manifestFile) ipcRenderer.send('readManifest', manifestFile, resVer)
          } else {
            this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noNetwork'))
          }
        }
      })
    })
  }
}
