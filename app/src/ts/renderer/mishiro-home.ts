import TheTable from '../../vue/component/TheTable.vue'
// import TaskLoading from '../../vue/component/TaskLoading.vue'
import InputText from '../../vue/component/InputText.vue'
import ProgressBar from '../../vue/component/ProgressBar.vue'

import * as path from 'path'
import fs from './fs-extra'
import { downloadDir } from '../common/get-path'
import { shell, ipcRenderer, remote, Event } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
// import { ProgressInfo } from 'mishiro-core'

@Component({
  components: {
    TheTable,
    ProgressBar,
    InputText
  }
})
export default class extends Vue {
  dler = new this.core.Downloader()
  downloadBtnDisable: boolean = false
  queryString: string = ''
  text: string = ''
  data: any[] = []
  selectedItem: any[] = []
  current: number = 0
  total: number = 0
  page: number = 0
  recordPerPage: number = 10

  get totalPage () {
    if (!this.data.length) return 0
    return this.data.length / this.recordPerPage === Math.floor(this.data.length / this.recordPerPage) ? this.data.length / this.recordPerPage - 1 : Math.floor(this.data.length / this.recordPerPage)
  }

  isDisabled (row: any) {
    return fs.existsSync(downloadDir(path.basename(row.name)))
  }

  opendir () {
    this.playSe(this.enterSe)
    shell.openExternal(downloadDir())
  }
  query () {
    if (this.queryString === '') {
      this.page = 0
      this.data = []
      // this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noEmptyString'))
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
    this.playSe(this.cancelSe)
    this.downloadBtnDisable = false
    this.total = 0
    this.current = 0
    this.text = ''
    this.dler.stop(() => this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noTask')))
  }
  async downloadSelectedItem () {
    this.playSe(this.enterSe)
    if (!navigator.onLine) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noNetwork'))
      return
    }
    const tasks = this.selectedItem.slice(0)

    if (tasks.length > 0) {
      this.downloadBtnDisable = true

      let errorList = await this.dler.batchDownload(
        tasks,
        downloadDir(),
        (_row, filepath) => {
          this.current = 0
          this.total = 100 * this.dler.index / tasks.length
          this.text = path.basename(filepath)
        },
        prog => {
          this.text = `${prog.name}　${Math.ceil(prog.current / 1024)}/${Math.ceil(prog.max / 1024)} KB`
          this.current = prog.loading
          this.total = 100 * this.dler.index / tasks.length + prog.loading / tasks.length
        },
        (row, filepath) => {
          console.log(row.name)
          const name = path.basename(filepath)
          const suffix = path.extname(row.name)

          this.current = 0
          this.text = ''
          if (suffix !== '.acb') {
            if (fs.existsSync(filepath)) {
              fs.removeSync(filepath)
              this.event.$emit('completeTask', name + suffix)
            } else this.event.$emit('completeTask', name + suffix, false)
          } else {
            if (fs.existsSync(filepath)) this.event.$emit('completeTask', name)
            else this.event.$emit('completeTask', name, false)
          }
        },
        () => {
          this.current = 0
          this.text = ''
        }
      )
      // let taskArr: string[][] = []
      // for (let i = 0; i < task.length; i++) {
      //   if (path.extname(task[i].name) === '.acb') {
      //     taskArr.push([this.getAcbUrl(path.dirname(task[i].name), task[i].hash), downloadDir(path.basename(task[i].name)), 'acb'])
      //   } else if (path.extname(task[i].name) === '.unity3d') {
      //     taskArr.push([this.getUnityUrl(task[i].hash), downloadDir(path.basename(task[i].name, '.unity3d')), 'unity3d'])
      //   } else if (path.extname(task[i].name) === '.bdb') {
      //     taskArr.push([this.getDbUrl(task[i].hash), downloadDir(path.basename(task[i].name, '.bdb')), 'bdb'])
      //   } else if (path.extname(task[i].name) === '.mdb') {
      //     taskArr.push([this.getDbUrl(task[i].hash), downloadDir(path.basename(task[i].name, '.mdb')), 'mdb'])
      //   }
      // }

      // let failedList = await this.dler.download(taskArr, ([_url, filepath]) => {
      //   this.current = 0
      //   this.total = 100 * this.dler.index / taskArr.length
      //   this.text = path.basename(filepath)
      // }, (prog: ProgressInfo) => {
      //   this.text = `${prog.name}　${Math.ceil(prog.current / 1024)}/${Math.ceil(prog.max / 1024)} KB`
      //   this.current = prog.loading
      //   this.total = 100 * this.dler.index / taskArr.length + prog.loading / taskArr.length
      // }, ([_url, filepath, suffix]) => {
      //   const name = path.basename(filepath)
      //   this.current = 0
      //   this.text = ''
      //   if (suffix !== 'acb') {
      //     if (fs.existsSync(filepath)) {
      //       if (suffix === 'unity3d') {
      //         this.core.util.lz4dec(filepath, 'unity3d')
      //       } else if (suffix === 'bdb') {
      //         this.core.util.lz4dec(filepath, 'bdb')
      //       } else if (suffix === 'mdb') {
      //         this.core.util.lz4dec(filepath, 'mdb')
      //       }
      //       fs.unlinkSync(filepath)
      //       this.event.$emit('completeTask', name + '.' + suffix)
      //     } else this.event.$emit('completeTask', name + '.' + suffix, false)
      //   } else {
      //     if (fs.existsSync(filepath)) this.event.$emit('completeTask', name)
      //     else this.event.$emit('completeTask', name, false)
      //   }
      // }, () => {
      //   this.current = 0
      //   this.text = ''
      // })
      this.total = 0
      this.downloadBtnDisable = false
      if (errorList.length) this.event.$emit('alert', this.$t('home.download'), `Failed: ${errorList.length}`)
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
        this.page = 0
        this.data = manifestArr
      })
    })
  }
}
