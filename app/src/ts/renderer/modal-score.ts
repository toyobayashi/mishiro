
import InputRadio from '../../vue/component/InputRadio.vue'

import modalMixin from './modal-mixin'
import Component, { mixins } from 'vue-class-component'

const { remote } = window.node.electron
const getPath = window.preload.getPath
const { scoreDir, liveDir } = getPath
const url = window.node.url

@Component({
  components: {
    InputRadio
  }
})
export default class extends mixins(modalMixin) {
  difficulty: string = '4'
  live: any = {}
  difficulties: { [key: string]: string } = {}

  async start (): Promise<void> {
    this.playSe(this.enterSe)
    const res = await window.preload.getScore(
      scoreDir(this.live.score), // scoreFile)
      this.difficulty, // difficulty
      this.live.bpm, // bpm
      liveDir(this.live.fileName) // audioFile
    )
    if (!res) return

    this.event.$emit('gameStart')
    this.event.$emit('pauseBgm')
    // const windowID = ipcRenderer.sendSync('mainWindowId')

    let win: import('electron').BrowserWindow | null = new remote.BrowserWindow({
      width: 1296,
      height: 759,
      // minWidth: 1296,
      // minHeight: 759,
      // maxWidth: 1296,
      // maxHeight: 759,
      // parent: remote.BrowserWindow.fromId(windowID),
      backgroundColor: '#000000',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: false,
        preload: window.preload.getPath('preload', 'preload.js')
      }
    })

    if (process.env.NODE_ENV === 'production') {
      win.loadURL(url.format({
        pathname: getPath('./renderer/score.html'),
        protocol: 'file:',
        slashes: true
      })).catch(err => console.log(err))
    } else {
      // const config = require('../../../script/config.ts').default
      win.loadURL('http://localhost:8090/app/renderer/score.html').catch(err => console.log(err))
      win.webContents.openDevTools()
    }

    win.on('close', () => {
      win = null
    })

    this.visible = false
    // ipcRenderer.send(
    //   'score',
    //   scoreDir(this.live.score), // scoreFile
    //   this.difficulty, // difficulty
    //   this.live.bpm, // bpm
    //   liveDir(this.live.fileName) // audioFile
    // )
  }

  mounted (): void {
    this.$nextTick(() => {
      // ipcRenderer.on('score', (_event: Event) => {

      //   this.event.$emit('gameStart')
      //   this.event.$emit('pauseBgm')
      //   // const windowID = ipcRenderer.sendSync('mainWindowId')

      //   let win: import('electron').BrowserWindow | null = new remote.BrowserWindow({
      //     width: 1296,
      //     height: 759,
      //     // minWidth: 1296,
      //     // minHeight: 759,
      //     // maxWidth: 1296,
      //     // maxHeight: 759,
      //     // parent: remote.BrowserWindow.fromId(windowID),
      //     backgroundColor: '#000000',
      //     webPreferences: {
      //       nodeIntegration: false,
      //       contextIsolation: false,
      //       preload: window.preload.getPath('public', 'preload.js')
      //     }
      //   })

      //   if (process.env.NODE_ENV === 'production') {
      //     win.loadURL(url.format({
      //       pathname: getPath('./public/score.html'),
      //       protocol: 'file:',
      //       slashes: true
      //     }))
      //   } else {
      //     const config = require('../../../script/config.ts').default
      //     win.loadURL(`http://${config.devServerHost}:${config.devServerPort}${config.publicPath}score.html`)
      //     win.webContents.openDevTools()
      //   }

      //   win.on('close', () => {
      //     win = null
      //   })

      //   this.visible = false
      // })
      this.event.$on('score', (live: any, difficulties: { [key: string]: string }) => {
        const diffs = Object.keys(difficulties)
        if (diffs.length === 0) {
          this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('live.noScore'))
          return
        }
        this.difficulties = difficulties
        this.difficulty = diffs.length.toString()
        this.live = live
        this.show = true
        this.visible = true
      })
      this.event.$on('enterKey', (block: string) => {
        if (block === 'live' && this.visible) {
          this.start().catch(err => console.log(err))
        }
      })
    })
  }
}
