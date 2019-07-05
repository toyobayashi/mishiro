import TheTable from '../../vue/component/TheTable.vue'
// import TaskLoading from '../../vue/component/TaskLoading.vue'
import InputText from '../../vue/component/InputText.vue'
import ProgressBar from '../../vue/component/ProgressBar.vue'

import * as path from 'path'
import fs from './fs'
import getPath from './get-path'
import { shell, ipcRenderer, remote, Event } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { generateObjectId } from '../common/object-id'
// import { ProgressInfo } from 'mishiro-core'

const { downloadDir } = getPath

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
  notDownloadedOnly: boolean = false
  canDownloadRows: any[] = []

  get totalPage () {
    const canDownload: any[] = this.canDownloadRows
    if (!canDownload.length) return 0
    return canDownload.length / this.recordPerPage === Math.floor(canDownload.length / this.recordPerPage) ? canDownload.length / this.recordPerPage - 1 : Math.floor(canDownload.length / this.recordPerPage)
  }

  // get canDownloadRows () {
  //   if (!this.notDownloadedOnly) return this.data
  //   return this.data.filter(row => !this.isDisabled(row))
  // }

  checkFile (data: any[]): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
      const id = generateObjectId()
      ipcRenderer.once('checkFile', (_ev: Event, oid: string, notDownloaded: any[]) => {
        if (oid === id) {
          resolve(notDownloaded)
        } else {
          reject(new Error(`${id} !== ${oid}`))
        }
      })
      ipcRenderer.send('checkFile', id, data)
    })
  }

  isDisabled (row: any) {
    return fs.existsSync(downloadDir(path.basename(row.name)))
  }

  opendir () {
    this.playSe(this.enterSe)
    const dir = downloadDir()
    if (!fs.existsSync(dir)) fs.mkdirsSync(dir)
    process.platform === 'win32' ? shell.openExternal(dir) : shell.showItemInFolder(dir + '/.')
  }
  query () {
    if (this.queryString === '') {
      this.page = 0
      this.data = []
      this.canDownloadRows = []
      // this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noEmptyString'))
    } else if (this.queryString === 'dev') {
      remote.getCurrentWindow().webContents.openDevTools()
    } else {
      ipcRenderer.send('queryManifest', this.queryString)
    }
    this.playSe(this.enterSe)
  }
  filterOnClick () {
    this.notDownloadedOnly = !this.notDownloadedOnly
    if (!this.notDownloadedOnly) {
      this.canDownloadRows = this.data
      this.page = 0
    } else {
      this.checkFile(this.data).then((res) => {
        this.canDownloadRows = res
        this.page = 0
      }).catch(err => console.log(err))
    }
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
          // console.log(row.name)
          const name = path.basename(filepath)
          const suffix = path.extname((row && row.name) || (tasks[this.dler.index] && tasks[this.dler.index].name) || '')

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
        if (!this.notDownloadedOnly) {
          this.canDownloadRows = this.data
        } else {
          this.checkFile(this.data).then((res) => {
            this.canDownloadRows = res
          }).catch(err => console.log(err))
        }
      })
    })
  }
}
