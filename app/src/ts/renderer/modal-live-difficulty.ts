
import InputRadio from '../../vue/component/InputRadio.vue'
import { Event } from 'electron'
import modalMixin from './modal-mixin'
import Component, { mixins } from 'vue-class-component'

const { ipcRenderer, remote } = window.node.electron
const getPath = window.preload.getPath
const url = window.node.url
const BrowserWindow = remote.BrowserWindow
const { scoreDir, liveDir } = getPath

@Component({
  components: {
    InputRadio
  }
})
export default class extends mixins(modalMixin) {

  difficulty: string = '4'
  live: any = {}

  start () {
    this.playSe(this.enterSe)
    ipcRenderer.send(
      'game',
      scoreDir(this.live.score), // scoreFile
      this.difficulty, // difficulty
      this.live.bpm, // bpm
      liveDir(this.live.fileName) // audioFile
    )
  }
  mounted () {
    this.$nextTick(() => {
      ipcRenderer.on('game', (_event: Event, obj: { src: string; bpm: number; score: any[][]; fullCombo: number;}) => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (!focusedWindow) return
        this.event.$emit('gameStart')
        this.event.$emit('pauseBgm')
        const windowID = focusedWindow.id

        let win = new BrowserWindow({
          width: 1296,
          height: 759,
          minWidth: 1296,
          minHeight: 759,
          maxWidth: 1296,
          maxHeight: 759,
          backgroundColor: '#000000',
          parent: focusedWindow,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,
            preload: window.preload.getPath('public', 'preload.js')
          }
        })

        if (process.env.NODE_ENV === 'production') {
          win.loadURL(url.format({
            pathname: getPath('./public/game.html'),
            protocol: 'file:',
            slashes: true
          }))
        } else {
          const config = require('../../../script/config.ts').default
          win.loadURL(`http://${config.devServerHost}:${config.devServerPort}${config.publicPath}game.html`)
        }

        win.webContents.on('did-finish-load', function () {
          win.webContents.send('start', obj, windowID)
        })

        this.visible = false
      })
      this.event.$on('game', (live: any) => {
        this.difficulty = '4'
        this.live = live
        this.show = true
        this.visible = true
      })
      this.event.$on('enterKey', (block: string) => {
        if (block === 'live' && this.visible) {
          this.start()
        }
      })
    })
  }
}
