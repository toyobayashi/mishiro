import { Vue, Component } from 'vue-property-decorator'
import { exit, relaunch } from './ipc'
import license from './license'
import updater from './updater'

import getPath from '../common/get-path'
import { error } from './log'
const fs = window.node.fs

const { dataDir } = getPath

@Component
export default class extends Vue {
  showOption (btn: HTMLElement): void {
    btn.blur()
    this.playSe(this.enterSe)
    this.event.$emit('option', true)
  }

  showAbout (): void {
    this.playSe(this.enterSe)
    this.event.$emit('showAbout')
  }

  showLicense (): void {
    this.playSe(this.enterSe)
    // tslint:disable-next-line: no-floating-promises
    import(/* webpackChunkName: "marked" */ 'marked').then((marked) => {
      this.event.$emit('license')
      this.event.$emit('alert', this.$t('menu.license'), (marked as any).default(license), 900)
    }).catch(err => {
      console.error(err)
      error(`MENU showLicense: ${err.stack}`)
    })
  }

  showVar (): void {
    this.playSe(this.enterSe)
    this.event.$emit('alert', this.$t('menu.var'), this.$t('menu.varCon'))
  }

  async update (): Promise<void> {
    this.playSe(this.enterSe)
    if (!navigator.onLine) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noNetwork'))
      return
    }
    this.$emit('checking')

    await updater.check()
    this.$emit('checked')

    const info = updater.getUpdateInfo()
    if (info) {
      this.event.$emit('versionCheck', info)
    } else {
      this.event.$emit('alert', this.$t('menu.update'), this.$t('menu.noUpdate'))
    }
    // const headers = {
    //   'User-Agent': 'mishiro'
    // }
    // const releases = {
    //   url: 'https://api.github.com/repos/toyobayashi/mishiro/releases',
    //   json: true,
    //   headers
    // }
    // const tags = {
    //   url: 'https://api.github.com/repos/toyobayashi/mishiro/tags',
    //   json: true,
    //   headers
    // }
    // request(releases, (err, _res, body) => {
    //   if (!err) {
    //     const latest = body[0]
    //     const version = latest.tag_name.substr(1)
    //     if (getVersion() >= version) {
    //       this.$emit('checked')
    //       this.event.$emit('alert', this.$t('menu.update'), this.$t('menu.noUpdate'))
    //     } else {
    //       const description = marked(latest.body)
    //       const zip = latest.assets.filter((a: any) => ((a.content_type === 'application/x-zip-compressed' || a.content_type === 'application/zip') && (a.name.indexOf(`${process.platform}-${process.arch}`) !== -1)))[0]
    //       const exe = latest.assets.filter((a: any) => ((a.content_type === 'application/x-msdownload') && (a.name.indexOf(`${process.platform}-${process.arch}`) !== -1)))[0]
    //       const patch = latest.assets.filter((a: any) => (a.name.indexOf('patch.zip') !== -1))[0]
    //       const zipUrl = zip ? zip.browser_download_url : null
    //       const exeUrl = exe ? exe.browser_download_url : null
    //       const patchUrl = patch ? patch.browser_download_url : null

    //       request(tags, (err, _res, body) => {
    //         this.$emit('checked')
    //         if (!err) {
    //           const latestTag = body.filter((tag: any) => tag.name === latest.tag_name)[0]
    //           const commit = latestTag.commit.sha
    //           const versionData = { version, commit, description, zipUrl, exeUrl, patchUrl }
    //           console.log(versionData)
    //           this.event.$emit('versionCheck', versionData)
    //         } else {
    //           this.event.$emit('alert', this.$t('home.errorTitle'), err.message)
    //         }
    //       })
    //     }
    //   } else {
    //     this.event.$emit('alert', this.$t('home.errorTitle'), err.message)
    //   }
    // })
  }

  relaunch (): void {
    this.playSe(this.enterSe)
    relaunch({ args: [getPath()] })
    exit(0)
  }

  calculator (): void {
    this.playSe(this.enterSe)
    this.event.$emit('openCal')
  }

  exit (): void {
    exit(0)
    this.playSe(this.cancelSe)
  }

  cacheClear (): void {
    this.playSe(this.enterSe)
    const files = fs.readdirSync(dataDir())
    const deleteItem = []
    for (let i = 0; i < files.length; i++) {
      if (!new RegExp(`${this.$store.state.resVer === -1 ? 'Unknown' : this.$store.state.resVer}`).test(files[i])) deleteItem.push(dataDir(files[i]))
    }
    if (deleteItem.length) {
      Promise.all(deleteItem.map(item => fs.remove(item))).then(() => {
        this.event.$emit('alert', this.$t('menu.cacheClear'), this.$t('menu.cacheClearSuccess'))
      }).catch(err => this.event.$emit('alert', this.$t('home.errorTitle'), err && err.message))
    } else this.event.$emit('alert', this.$t('menu.cacheClear'), this.$t('menu.noCache'))
  }
}
