import TheTable from '../../vue/component/TheTable.vue'
import TaskLoading from '../../vue/component/TaskLoading.vue'
import InputText from '../../vue/component/InputText.vue'
import Downloader from './downloader'
import * as fs from 'fs'
import getPath from '../common/get-path'
import { shell, ipcRenderer, remote, Event } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { ProgressInfo } from '../common/request'

const dler = new Downloader()
@Component({
  components: {
    TheTable,
    TaskLoading,
    InputText
  }
})
export default class extends Vue {

  queryString: string = ''
  text: string = ''
  data: any[] = []
  selectedItem: any[] = []
  current: number = 0
  total: number = 0
  isDisabled (row: any) {
    return fs.existsSync(getPath(`./download/${(row.name.indexOf('/') === -1) ? row.name : row.name.split('/')[1]}`))
  }

  opendir () {
    this.playSe(this.enterSe)
    shell.openExternal(getPath('./download'))
  }
  query () {
    if (this.queryString === '') {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noEmptyString'))
    } else if (this.queryString === 'dev') {
      remote.getCurrentWindow().webContents.openDevTools()
    } else {
      ipcRenderer.send('queryManifest', this.queryString)
    }
    this.playSe(this.enterSe)
  }
  tableChange (val: any[]) {
    this.selectedItem = val
  }
  stopDownload () {
    this.playSe(this.cancelSe);
    (this.$refs.downloadBtn as HTMLElement).removeAttribute('disabled')
    this.total = 0
    this.current = 0
    this.text = ''
    dler.stop(() => this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noTask')))
  }
  async downloadSelectedItem () {
    this.playSe(this.enterSe)
    if (!navigator.onLine) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noNetwork'))
      return
    }
    const task = this.selectedItem.slice(0)

    if (task.length > 0) {
      (this.$refs.downloadBtn as HTMLElement).setAttribute('disabled', 'disabled')
      let taskArr: string[][] = []
      for (let i = 0; i < task.length; i++) {
        if (task[i].name.split('.')[1] === 'acb') {
          taskArr.push([this.getAcbUrl(task[i].name.split('/')[0], task[i].hash), getPath(`./download/${task[i].name.split('/')[1]}`), 'acb'])
        } else if (task[i].name.split('.')[1] === 'unity3d') {
          taskArr.push([this.getUnityUrl(task[i].hash), getPath(`./download/${task[i].name.split('.')[0]}`), 'unity3d'])
        } else if (task[i].name.split('.')[1] === 'bdb') {
          taskArr.push([this.getDbUrl(task[i].hash), getPath(`./download/${task[i].name.split('.')[0]}`), 'bdb'])
        } else if (task[i].name.split('.')[1] === 'mdb') {
          taskArr.push([this.getDbUrl(task[i].hash), getPath(`./download/${task[i].name.split('.')[0]}`), 'mdb'])
        }
      }

      let failedList = await dler.batchDl(taskArr, (name) => {
        this.current = 0
        this.text = name
      }, (prog: ProgressInfo) => {
        this.text = `${prog.name}　${Math.ceil(prog.current / 1024)}/${Math.ceil(prog.max / 1024)} KB`
        this.current = prog.loading
        this.total = 100 * dler.index / taskArr.length + prog.loading / taskArr.length
      }, (name: string, filepath: string, suffix: string) => {
        this.current = 0
        this.text = ''
        if (suffix !== 'acb') {
          fs.readFile(filepath, 'utf-8', (err, data) => {
            if (err) throw err
            if (data !== 'File not found."') {
              if (suffix === 'unity3d') {
                this.lz4dec(filepath, 'unity3d')
              } else if (suffix === 'bdb') {
                this.lz4dec(filepath, 'bdb')
              } else if (suffix === 'mdb') {
                this.lz4dec(filepath, 'mdb')
              }
              fs.unlinkSync(getPath(`./download/${name.split('.')[0]}`))
            } else {
              fs.unlinkSync(getPath(`./download/${name}`))
            }
          })
          this.event.$emit('completeTask', name + '.' + suffix)
        } else {
          this.event.$emit('completeTask', name)
        }
      }, () => {
        this.current = 0
        this.text = ''
      })
      this.total = 0;
      (this.$refs.downloadBtn as HTMLElement).removeAttribute('disabled')
      if (failedList.length) this.event.$emit('alert', this.$t('home.download'), `Failed: ${failedList.length}`)
    } else {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noEmptyDownload'))
    }
  }

  mounted () {
    this.$nextTick(() => {
      this.event.$on('enterKey', (block: string) => {
        if (block === 'home') {
          this.query()
        }
      })
      ipcRenderer.on('queryManifest', (_event: Event, manifestArr: any[]) => {
        this.data = manifestArr
      })
    })
  }
}
