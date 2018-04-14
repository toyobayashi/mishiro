import TheTable from '../../vue/component/TheTable.vue'
import TaskLoading from '../../vue/component/TaskLoading.vue'
import InputText from '../../vue/component/InputText.vue'
import Downloader from './downloader.js'
import fs from 'fs'
import getPath from '../common/get-path.ts'
import { shell, ipcRenderer, remote } from 'electron'

const dler = new Downloader()
export default {
  components: {
    TheTable,
    TaskLoading,
    InputText
  },
  data () {
    return {
      queryString: '',
      text: '',
      data: [],
      selectedItem: [],
      current: 0,
      total: 0,
      isDisabled (row) {
        return fs.existsSync(getPath(`./download/${(row.name.indexOf('/') === -1) ? row.name : row.name.split('/')[1]}`))
      }
    }
  },
  methods: {
    opendir () {
      this.playSe(this.enterSe)
      if (!fs.existsSync(getPath('./download'))) {
        fs.mkdirSync(getPath('./download'))
      }
      shell.openExternal(getPath('./download'))
    },
    query () {
      if (this.queryString === '') {
        this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noEmptyString'))
      } else if (this.queryString === 'dev') {
        remote.getCurrentWindow().webContents.openDevTools()
      } else {
        ipcRenderer.send('queryManifest', this.queryString)
      }
      this.playSe(this.enterSe)
    },
    tableChange (val) {
      this.selectedItem = val
    },
    stopDownload () {
      this.playSe(this.cancelSe)
      this.$refs.downloadBtn.removeAttribute('disabled')
      this.total = 0
      this.current = 0
      this.text = ''
      dler.stop(() => this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noTask')))
    },
    async downloadSelectedItem () {
      this.playSe(this.enterSe)
      if (!fs.existsSync(getPath('./download'))) {
        fs.mkdirSync(getPath('./download'))
      }
      if (!navigator.onLine) {
        this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noNetwork'))
        return
      }
      const task = this.selectedItem.slice(0)

      if (task.length > 0) {
        this.$refs.downloadBtn.setAttribute('disabled', 'disabled')
        let taskArr = []
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
        }, (prog) => {
          this.text = `${prog.name}　${Math.ceil(prog.current / 1024)}/${Math.ceil(prog.max / 1024)} KB`
          this.current = prog.loading
          this.total = 100 * dler.index / taskArr.length + prog.loading / taskArr.length
        }, (name, filepath, suffix) => {
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
        this.total = 0
        this.$refs.downloadBtn.removeAttribute('disabled')
        if (failedList.length) this.event.$emit('alert', this.$t('home.download'), `Failed: ${failedList.length}`)
      } else {
        this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noEmptyDownload'))
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.event.$on('enterKey', (block) => {
        if (block === 'home') {
          this.query()
        }
      })
      ipcRenderer.on('queryManifest', (event, manifestArr) => {
        this.data = manifestArr
      })
    })
  }
}
