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
import type { IDownloadProgress } from '@tybys/downloader'
import { showOpenDialog } from './ipc'
import { error } from './log'
import type { MishiroConfig } from '../main/config'
import configurer from './config'

const fs = window.node.fs
const path = window.node.path
const { shell } = window.node.electron
const { downloadDir } = getPath

const { Downloader, DownloadErrorCode } = window.node.tybys.downloader
const mishiroCore = window.node.mishiroCore

@Component({
  components: {
    TheTable,
    ProgressBar,
    InputText
  }
})
export default class extends Vue {
  autoDecLz4: boolean = true
  dler: InstanceType<typeof Downloader> | null = null
  downloadBtnDisable: boolean = false
  queryString: string = ''
  text: string = ''
  data: ResourceData[] = []
  selectedItem: ResourceData[] = []
  current: number = 0
  total: number = 0
  page: number = 0
  recordPerPage: number = 10
  notDownloadedOnly: boolean = false
  canDownloadRows: ResourceData[] = []

  manualStop = false

  get totalPage (): number {
    const canDownload = this.canDownloadRows
    if (!canDownload.length) return 0
    return canDownload.length / this.recordPerPage === Math.floor(canDownload.length / this.recordPerPage) ? canDownload.length / this.recordPerPage - 1 : Math.floor(canDownload.length / this.recordPerPage)
  }

  created (): void {
    this.event.$on('optionSaved', (options: MishiroConfig) => {
      if (this.dler) {
        this.dler.settings.agent = options.proxy ?? ''
      }
    })
  }

  // get canDownloadRows () {
  //   if (!this.notDownloadedOnly) return this.data
  //   return this.data.filter(row => !this.isDisabled(row))
  // }

  checkFile (data: ResourceData[]): ResourceData[] {
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

  isDisabled (row: ResourceData): boolean {
    return fs.existsSync(downloadDir(path.basename(row.name)))
  }

  opendir (): void {
    this.playSe(this.enterSe)
    const dir = downloadDir()
    if (!fs.existsSync(dir)) fs.mkdirsSync(dir)
    if (window.node.process.platform === 'win32') {
      shell.openExternal(dir).catch(err => {
        console.error(err)
        error(`HOME openExternal: ${err.stack}`)
      })
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
          // }).catch(err => console.error(err))
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
      } catch (err: any) {
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
      // }).catch(err => console.error(err))
      this.canDownloadRows = this.checkFile(this.data)
      this.page = 0
    }
  }

  tableChange (val: ResourceData[]): void {
    this.selectedItem = val
  }

  stopDownload (): void {
    this.playSe(this.cancelSe)
    this.downloadBtnDisable = false
    this.total = 0
    this.current = 0
    this.text = ''
    this.manualStop = true
    if (this.dler) {
      this.dler.dispose()
      this.dler = null
    } else {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noTask'))
    }
  }

  downloadSelectedItem (): void {
    this.playSe(this.enterSe)
    if (!navigator.onLine) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noNetwork'))
      return
    }
    const tasks = this.selectedItem.slice(0)

    if (tasks.length <= 0) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noEmptyDownload'))
      return
    }

    this.downloadBtnDisable = true

    let completeCount = 0
    let start = 0

    const createCompleteHandler = (row: ResourceData, compressed: boolean, p: string, suffix: string) => () => {
      const ext = path.extname((row && row.name) || '')
      if (compressed) {
        if (this.autoDecLz4) {
          if (fs.existsSync(p)) {
            mishiroCore.util.Lz4.decompress(p, suffix)
            fs.removeSync(p)
            this.event.$emit('completeTask', row.hash)
          } else {
            this.event.$emit('completeTask', row.hash, false)
          }
        } else {
          if (fs.existsSync(p)) {
            fs.renameSync(p, p + ext)
            this.event.$emit('completeTask', row.hash)
          } else {
            this.event.$emit('completeTask', row.hash, false)
          }
        }
      } else {
        if (fs.existsSync(p)) {
          this.event.$emit('completeTask', row.hash)
        } else {
          this.event.$emit('completeTask', row.hash, false)
        }
      }
    }

    const onStart = (name: string) => () => {
      this.current = 0
      this.total = 100 * completeCount / tasks.length
      this.text = name
    }

    const updateProgress = (prog: IDownloadProgress): void => {
      const name = path.basename(prog.path)
      this.text = `${name}　${Math.ceil(prog.completedLength / 1024)}/${Math.ceil(prog.totalLength / 1024)} KB`
      this.current = prog.percent
      this.total = 100 * completeCount / tasks.length + prog.percent / tasks.length
    }

    const onProgress = (prog: IDownloadProgress): void => {
      if (prog.completedLength === 0 || prog.percent === 100) {
        updateProgress(prog)
      } else {
        const now = Date.now()
        if ((now - start) > mishiroCore.config.getCallbackInterval()) {
          start = now
          updateProgress(prog)
        }
      }
    }

    this.dler = new Downloader()
    this.dler.settings.agent = configurer.get('proxy') ?? ''
    this.dler.settings.headers = {
      'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)',
      'X-Unity-Version': '2018.3.8f1',
      'Accept-Encoding': 'gzip',
      Connection: 'Keep-Alive'
    }

    const targetDir = downloadDir()
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i]
      const { name, hash } = t
      const ext = path.extname(name)
      const basename = path.basename(name, (ext !== '.acb' && ext !== '.awb' && ext !== '.usm') ? ext : '')
      // const p = path.join(targetDir, basename)

      let url: string

      if (ext === '.acb' || ext === '.awb') {
        url = mishiroCore.Downloader.getUrl(mishiroCore.ResourceType.SOUND, hash)
        const download = this.dler.add(url, { dir: targetDir, out: basename })
        download.on('activate', onStart(path.basename(download.path)))
        download.once('complete', createCompleteHandler(t, false, download.path, ''))
        download.on('progress', onProgress)
      } else if (ext === '.unity3d') {
        url = mishiroCore.Downloader.getUrl(mishiroCore.ResourceType.ASSET, hash)
        const download = this.dler.add(url, { dir: targetDir, out: basename })
        download.on('activate', onStart(path.basename(download.path)))
        download.once('complete', createCompleteHandler(t, true, download.path, '.unity3d'))
        download.on('progress', onProgress)
      } else if (ext === '.bdb' || ext === '.mdb') {
        url = mishiroCore.Downloader.getUrl(mishiroCore.ResourceType.DATABASE, hash)
        const download = this.dler.add(url, { dir: targetDir, out: basename })
        download.on('activate', onStart(path.basename(download.path)))
        download.once('complete', createCompleteHandler(t, true, download.path, ext))
        download.on('progress', onProgress)
      } else if (ext === '.usm') {
        url = mishiroCore.Downloader.getUrl(mishiroCore.ResourceType.MOVIE, hash)
        const download = this.dler.add(url, { dir: targetDir, out: basename })
        download.on('activate', onStart(path.basename(download.path)))
        download.once('complete', createCompleteHandler(t, false, download.path, ''))
        download.on('progress', onProgress)
      } else {
        continue
      }
    }

    const downloader = this.dler
    this.dler.on('done', (_download) => {
      this.current = 0
      this.text = ''
      completeCount++
      this.total = 100 * completeCount / tasks.length

      if (downloader.countWaiting() <= 0 && downloader.countActive() <= 0) {
        this.downloadBtnDisable = false
        this.total = 0
        const errorList = downloader.tellFailed().filter(d => (d.error != null) && (d.error.code !== DownloadErrorCode.ABORT))
        if (errorList.length) this.event.$emit('alert', this.$t('home.download'), `Failed: ${errorList.length}`)

        downloader.dispose()
        this.dler = null
      }
    })
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
    })
  }
}
