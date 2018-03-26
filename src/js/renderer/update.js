import fs from 'fs'
import path from 'path'
import ProgressBar from '../../vue/component/ProgressBar.vue'
import check from './check.js'
import downloadManifest from './download-manifest.js'
import downloadMaster from './download-master.js'
import Downloader from './downloader.js'
import { ipcRenderer } from 'electron'
import getPath from '../common/get-path.js'
import idol from './idol.js'
import player from './player.js'
import configurer from '../common/config.js'

export default {
  components: {
    ProgressBar
  },
  data () {
    return {
      loading: 0,
      isReady: false,
      text: this.$t('update.check'),
      appData: {
        resVer: 'Unknown',
        latestResVer: 'Unknown',
        master: {}
      }
    }
  },
  props: {
    'value': Object,
    'isTouched': Boolean
  },
  methods: {
    getEventCardId (eventAvailable) {
      eventAvailable.sort(function (a, b) {
        return a.recommend_order - b.recommend_order
      })
      return [eventAvailable[0].reward_id, eventAvailable[eventAvailable.length - 1].reward_id]
    },
    emitReady () {
      this.$emit('ready')
      // console.log("[event] ready");
      this.event.$emit('ready')
    },
    getResVer: async function () {
      let resVer = await check((prog) => { // 检查资源版本，回调更新进度条
        this.text = this.$t('update.check') + prog.current + ' / ' + prog.max
        this.loading = prog.loading
      })
      return resVer
    },
    getManifest: async function (resVer) {
      this.loading = 0
      this.text = this.$t('update.manifest')

      let manifestFile = ''
      if (fs.existsSync(getPath(`./data/manifest_${resVer}.db`))) {
        this.loading = 100
        manifestFile = getPath(`./data/manifest_${resVer}.db`)
        return manifestFile
      }
      try {
        const manifestLz4File = await downloadManifest(resVer, (prog) => {
          this.text = this.$t('update.manifest') + Math.ceil(prog.current / 1024) + '/' + Math.ceil(prog.max / 1024) + ' KB'
          this.loading = prog.loading
        })
        manifestFile = this.lz4dec(manifestLz4File, 'db')
        fs.unlinkSync(getPath(`./data/manifest_${resVer}`))
        return manifestFile
      } catch (errorPath) {
        this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
        return false
      }
    },
    getMaster: async function (resVer, masterHash) {
      this.loading = 0
      this.text = this.$t('update.master')

      let masterFile = ''
      if (fs.existsSync(getPath(`./data/master_${resVer}.db`))) {
        this.loading = 100
        masterFile = getPath(`./data/master_${resVer}.db`)
        return masterFile
      }
      try {
        const masterLz4File = await downloadMaster(resVer, masterHash, (prog) => {
          this.text = this.$t('update.master') + Math.ceil(prog.current / 1024) + '/' + Math.ceil(prog.max / 1024) + ' KB'
          this.loading = prog.loading
        })
        masterFile = this.lz4dec(masterLz4File, 'db')
        fs.unlinkSync(getPath(`./data/master_${resVer}`))
        return masterFile
      } catch (errorPath) {
        this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.downloadFailed') + '<br/>' + errorPath)
        return false
      }
    },
    sleep (ms) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, ms)
      })
    }
  },
  mounted () {
    this.$nextTick(() => {
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
        ipcRenderer.on('readManifest', async (event, masterHash, resVer) => {
          const masterFile = await this.getMaster(resVer, masterHash)
          if (masterFile) ipcRenderer.send('readMaster', masterFile)
        })
        ipcRenderer.on('readMaster', async (event, masterData) => {
          // console.log(masterData);
          let config = this.configurer.getConfigSync()
          const bgmList = player.data().bgmList
          const downloader = new Downloader()
          const toName = p => path.parse(p).name
          this.appData.master = masterData
          this.appData.latestResVer = config.latestResVer
          this.$emit('input', this.appData)

          const bgmManifest = masterData.bgmManifest
          for (let k in bgmList) {
            if (!fs.existsSync(path.join(getPath('./public'), bgmList[k].src))) {
              let acbName = `b/${toName(bgmList[k].src)}.acb`
              let hash = bgmManifest.filter(row => row.name === acbName)[0].hash
              try {
                let result = await downloader.download(
                  this.getBgmUrl(hash),
                  getPath(`./public/asset/sound/bgm/${toName(bgmList[k].src)}.acb`),
                  (prog) => {
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
            if (masterData.eventData.type != 2 && masterData.eventData.type != 6 && !fs.existsSync(getPath(`./public/asset/sound/bgm/bgm_event_${masterData.eventData.id}.mp3`))) {
              const eventBgmHash = bgmManifest.filter(row => row.name === `b/bgm_event_${masterData.eventData.id}.acb`)[0].hash
              try {
                let result = await downloader.download(
                  this.getBgmUrl(eventBgmHash),
                  getPath(`./public/asset/sound/bgm/bgm_event_${masterData.eventData.id}.acb`),
                  (prog) => {
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
            let result = await idol.methods.downloadCard.call(this, config.background, (prog) => {
              this.text = prog.name
              this.loading = prog.loading
            })
            if (result) {
              this.event.$emit('eventBgReady', config.background)
            }
          } else {
            // const cardIdEvolution = [(Number(cardId[0]) + 1), (Number(cardId[1]) + 1)];
            if (masterData.eventHappening) {
              let result = await idol.methods.downloadCard.call(this, Number(cardId[0]) + 1, (prog) => {
                this.text = prog.name
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
          await downloader.batchDl(iconTask, (name) => {
            this.text = name + '　' + downloader.index + '/' + iconTask.length
            this.loading = 100 * downloader.index / iconTask.length
          }, (prog) => {
            this.loading = 100 * downloader.index / iconTask.length + prog.loading / iconTask.length
          })
          // console.log(failedList)
          this.emitReady()
        })
        if (navigator.onLine) { // 判断网络是否连接
          const resVer = await this.getResVer()
          this.appData.resVer = Number(resVer)
          this.$emit('input', this.appData)
          /* if (!fs.existsSync(getPath('./public/bin'))) {
            const downloader = new Downloader()
            let result = await downloader.download(
              'https://github.com/toyobayashi/mishiro/releases/download/v1.1.5/mishiro-public-bin.zip',
              getPath('./public/mishiro-public-bin.zip'),
              prog => {
                this.text = prog.name + '　' + Math.ceil(prog.current / 1024) + '/' + Math.ceil(prog.max / 1024) + ' KB'
                this.loading = prog.loading
              }
            )
            if (result) {
              // await unzipBinary(result, getPath('./public'))
              ipcRenderer.send('binary', result, getPath('./public'))
            }
          } */
          const manifestFile = await this.getManifest(resVer)
          if (manifestFile) ipcRenderer.send('readManifest', manifestFile, resVer)
        } else { // 如果网络未连接则直接触发ready事件
          let resVer = (await configurer.getConfig()).latestResVer
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
