import TheTable from '../../vue/component/TheTable.vue'
// import TaskLoading from '../../vue/component/TaskLoading.vue'
import InputText from '../../vue/component/InputText.vue'
import ProgressBar from '../../vue/component/ProgressBar.vue'

// import { Event } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
// import { generateObjectId } from '../common/object-id'
// import { ProgressInfo } from 'mishiro-core'
import getPath from '../common/get-path'
import { formatSize } from '../common/util'
import { searchResources } from './ipc-back'
import { showOpenDialog } from './ipc'
import { error } from './log'

const fs = window.node.fs
const path = window.node.path
const { shell } = window.node.electron
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

  manualStop = false

  get totalPage (): number {
    const canDownload: any[] = this.canDownloadRows
    if (!canDownload.length) return 0
    return canDownload.length / this.recordPerPage === Math.floor(canDownload.length / this.recordPerPage) ? canDownload.length / this.recordPerPage - 1 : Math.floor(canDownload.length / this.recordPerPage)
  }

  // get canDownloadRows () {
  //   if (!this.notDownloadedOnly) return this.data
  //   return this.data.filter(row => !this.isDisabled(row))
  // }

  checkFile (data: any[]): any[] {
    // return new Promise<any[]>((resolve, reject) => {
    // const id = generateObjectId()
    // ipcRenderer.once('checkFile', (_ev: Event, oid: string, notDownloaded: any[]) => {
    //   if (oid === id) {
    //     resolve(notDownloaded)
    //   } else {
    //     reject(new Error(`${id} !== ${oid}`))
    //   }
    // })
    // ipcRenderer.send('checkFile', id, data)
    // })
    return data.filter(row => !fs.existsSync(getPath.downloadDir(path.basename(row.name))))
  }

  isDisabled (row: any): boolean {
    return fs.existsSync(downloadDir(path.basename(row.name)))
  }

  opendir (): void {
    this.playSe(this.enterSe)
    const dir = downloadDir()
    if (!fs.existsSync(dir)) fs.mkdirsSync(dir)
    if (window.node.process.platform === 'win32') {
      shell.openExternal(dir).catch(err => console.log(err))
    } else {
      shell.showItemInFolder(dir + '/.')
    }
  }

  query (): void {
    this.playSe(this.enterSe)
    if (this.queryString === '') {
      this.page = 0
      this.data = []
      this.canDownloadRows = []
      // this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noEmptyString'))
    } else {
      searchResources(this.queryString.trim()).then(manifestArr => {
        this.page = 0
        this.data = manifestArr
        if (!this.notDownloadedOnly) {
          this.canDownloadRows = this.data
        } else {
          // this.checkFile(this.data).then((res) => {
          //   this.canDownloadRows = res
          // }).catch(err => console.log(err))
          this.canDownloadRows = this.checkFile(this.data)
        }
      }).catch(err => {
        this.event.$emit('alert', this.$t('home.errorTitle'), err.message)
      })
      // ipcRenderer.send('queryManifest', this.queryString)
    }
  }

  tableFormatter (key: string, value: any): string {
    switch (key) {
      case 'size':
        return formatSize(value)
      default:
        return value
    }
  }

  headerFormatter (key: string): string {
    switch (key) {
      case 'name': return this.$t('home.cName') as string
      case 'hash': return this.$t('home.cHash') as string
      case 'size': return this.$t('home.cSize') as string
      default: return key
    }
  }

  async decryptUSM (): Promise<void> {
    const result = await showOpenDialog({
      title: this.$t('home.usmbtn') as string,
      defaultPath: downloadDir(),
      filters: [
        { name: 'USM', extensions: ['usm'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile', 'multiSelections', 'showHiddenFiles', 'dontAddToRecent']
    })

    if (result.canceled) return
    for (let i = 0; i < result.filePaths.length; i++) {
      const usmFile = result.filePaths[i]
      try {
        await this.core.movie.demuxAsync(usmFile)
      } catch (err) {
        error(`USM: ${err.message}`)
      }
    }
  }

  filterOnClick (): void {
    this.notDownloadedOnly = !this.notDownloadedOnly
    if (!this.notDownloadedOnly) {
      this.canDownloadRows = this.data
      this.page = 0
    } else {
      // this.checkFile(this.data).then((res) => {
      //   this.canDownloadRows = res
      //   this.page = 0
      // }).catch(err => console.log(err))
      this.canDownloadRows = this.checkFile(this.data)
      this.page = 0
    }
  }

  tableChange (val: any[]): void {
    this.selectedItem = val
  }

  stopDownload (): void {
    this.playSe(this.cancelSe)
    this.downloadBtnDisable = false
    this.total = 0
    this.current = 0
    this.text = ''
    this.manualStop = true
    this.dler.stop(() => this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noTask')))
  }

  async downloadSelectedItem (): Promise<void> {
    this.playSe(this.enterSe)
    if (!navigator.onLine) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noNetwork'))
      return
    }
    const tasks = this.selectedItem.slice(0)

    if (tasks.length > 0) {
      this.downloadBtnDisable = true

      const errorList = await this.dler.batchDownload(
        tasks,
        downloadDir(),
        // onStart
        (_row, filepath) => {
          this.current = 0
          this.total = 100 * this.dler.index / tasks.length
          this.text = path.basename(filepath)
        },
        // onData
        prog => {
          this.text = `${prog.name}　${Math.ceil(prog.current / 1024)}/${Math.ceil(prog.max / 1024)} KB`
          this.current = prog.loading
          this.total = 100 * this.dler.index / tasks.length + prog.loading / tasks.length
        },
        // onComplete
        (row, filepath) => {
          // console.log(row.name)
          const name = path.basename(filepath)
          const suffix = path.extname((row && row.name) || (tasks[this.dler.index] && tasks[this.dler.index].name) || '')

          this.current = 0
          this.text = ''
          if (suffix !== '.acb' && suffix !== '.awb' && suffix !== '.usm') {
            if (this.dler.autoDecLz4) {
              if (fs.existsSync(filepath)) {
                fs.removeSync(filepath)
                this.event.$emit('completeTask', name + suffix)
              } else this.event.$emit('completeTask', name + suffix, false)
            } else {
              if (fs.existsSync(filepath)) {
                fs.renameSync(filepath, filepath + suffix)
                this.event.$emit('completeTask', name + suffix)
              } else this.event.$emit('completeTask', name + suffix, false)
            }
          } else {
            if (fs.existsSync(filepath)) this.event.$emit('completeTask', name)
            else this.event.$emit('completeTask', name, false)
          }
        },
        // onStop
        () => {
          this.current = 0
          this.text = ''
        }
      )
      this.total = 0
      this.downloadBtnDisable = false
      if (this.manualStop) {
        this.manualStop = false
      } else {
        if (errorList.length) this.event.$emit('alert', this.$t('home.download'), `Failed: ${errorList.length}`)
      }
    } else {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noEmptyDownload'))
    }
  }

  onMouseWheel (e: WheelEvent): void {
    if (e.deltaY < 0) {
      this.previousPage()
    } else {
      this.nextPage()
    }
  }

  previousPage (): void {
    this.page !== 0 ? this.page -= 1 : this.page = this.totalPage
  }

  nextPage (): void {
    this.page !== this.totalPage ? this.page += 1 : this.page = 0
  }

  mounted (): void {
    this.$nextTick(() => {
      this.event.$on('enterKey', (block: string) => {
        if (block === 'home') {
          this.query()
        }
      })
      // ipcRenderer.on('queryManifest', (_event: Event, manifestArr: any[]) => {
      //   this.page = 0
      //   this.data = manifestArr
      //   if (!this.notDownloadedOnly) {
      //     this.canDownloadRows = this.data
      //   } else {
      //     this.checkFile(this.data).then((res) => {
      //       this.canDownloadRows = res
      //     }).catch(err => console.log(err))
      //   }
      // })
    })
  }
}
