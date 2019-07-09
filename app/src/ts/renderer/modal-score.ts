
import InputRadio from '../../vue/component/InputRadio.vue'
import { Event } from 'electron'

import modalMixin from './modal-mixin'
import Component, { mixins } from 'vue-class-component'

const { ipcRenderer, remote } = window.node.electron
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
  hasMasterPlus: boolean

  start () {
    this.playSe(this.enterSe)
    ipcRenderer.send(
      'score',
      scoreDir(this.live.score), // scoreFile
      this.difficulty, // difficulty
      this.live.bpm, // bpm
      liveDir(this.live.fileName) // audioFile
    )
  }
  mounted () {
    this.$nextTick(() => {
      ipcRenderer.on('score', (_event: Event) => {

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
            preload: window.preload.getPath('public', 'preload.js')
          }
        })

        if (process.env.NODE_ENV === 'production') {
          win.loadURL(url.format({
            pathname: getPath('./public/score.html'),
            protocol: 'file:',
            slashes: true
          }))
        } else {
          const config = require('../../../script/config.ts').default
          win.loadURL(`http://${config.devServerHost}:${config.devServerPort}${config.publicPath}score.html`)
          win.webContents.openDevTools()
        }

        win.on('close', () => {
          win = null
        })

        this.visible = false
      })
      this.event.$on('score', (live: any, hasMasterPlus: boolean) => {
        this.difficulty = '4'
        this.live = live
        this.show = true
        this.visible = true
        this.hasMasterPlus = hasMasterPlus
      })
      this.event.$on('enterKey', (block: string) => {
        if (block === 'live' && this.visible) {
          this.start()
        }
      })
    })
  }
}
