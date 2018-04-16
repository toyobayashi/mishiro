import { remote } from 'electron'
import { Vue, Component, Prop } from 'vue-property-decorator'
import * as marked from 'marked'
import request from '../common/request'
import getPath from '../common/get-path'
import * as fs from 'fs'
import { read, remove } from '../common/fse'

@Component
export default class extends Vue {
  @Prop() resVer: string | number

  showOption (btn: HTMLElement) {
    btn.blur()
    this.playSe(this.enterSe)
    this.event.$emit('option')
  }
  showAbout () {
    this.playSe(this.enterSe)
    this.event.$emit('showAbout')
  }
  async showLicense () {
    this.playSe(this.enterSe)
    this.event.$emit('license')
    this.event.$emit('alert', this.$t('menu.license'), marked(await read(getPath('./public/LICENSE.md'), 'utf8')), 900)
  }
  showVar () {
    this.playSe(this.enterSe)
    this.event.$emit('alert', this.$t('menu.var'), this.$t('menu.varCon'))
  }
  update () {
    this.playSe(this.enterSe)
    if (!navigator.onLine) {
      this.event.$emit('alert', this.$t('home.errorTitle'), this.$t('home.noNetwork'))
      return
    }
    this.$emit('checking')

    const headers = {
      'User-Agent': 'mishiro'
    }
    const releases = {
      url: 'https://api.github.com/repos/toyobayashi/mishiro/releases',
      headers
    }
    const tags = {
      url: 'https://api.github.com/repos/toyobayashi/mishiro/tags',
      headers
    }
    request(releases, (err, body) => {
      if (!err) {
        const latest = JSON.parse(body as string)[0]
        const version = latest.tag_name.substr(1)
        const description = marked(latest.body)
        const zip = latest.assets.filter((a: any) => a.content_type === 'application/x-zip-compressed')[0]
        const exe = latest.assets.filter((a: any) => a.content_type === 'application/x-msdownload')[0]
        const zipUrl = zip ? zip.browser_download_url : null
        const exeUrl = exe ? exe.browser_download_url : null

        request(tags, (err, body) => {
          this.$emit('checked')
          if (!err) {
            const latestTag = JSON.parse(body as string).filter((tag: any) => tag.name === latest.tag_name)[0]
            const commit = latestTag.commit.sha
            const versionData = { version, commit, description, zipUrl, exeUrl }
            // console.log(versionData)
            if (remote.app.getVersion() < version) {
              this.event.$emit('versionCheck', versionData)
            } else {
              this.event.$emit('alert', this.$t('menu.update'), this.$t('menu.noUpdate'))
            }
          } else {
            throw err
          }
        })
      } else {
        throw err
      }
    })
    /* const gitRoot = 'https://github.com'
    request.get(`${gitRoot}/toyobayashi/mishiro/releases`, (err, res, body) => {
      this.$emit('checked')
      if (!err) {
        let $ = cheerio.load(body)
        const title = $('.release.label-latest .release-title > a').text()
        const version = title.substr(title.indexOf(' v') + 2)
        const commitUrl = gitRoot + $('.release.label-latest .tag-references a[href*="commit"]').attr('href')
        const commit = commitUrl.split('/')[commitUrl.split('/').length - 1]

        const zipPath = $('.release.label-latest .release-body a[href$=".zip"][href*="releases/download"]').attr('href')
        const zipUrl = zipPath ? gitRoot + zipPath : null

        const exePath = $('.release.label-latest .release-body a[href$=".exe"]').attr('href')
        const exeUrl = exePath ? gitRoot + exePath : null

        const description = $('.release.label-latest .release-body .markdown-body').html().replace(/\n/g, '').trim()
        const versionData = { version, commit, description, commitUrl, zipUrl, exeUrl }
        // console.log(versionData)
        if (remote.app.getVersion() < version) {
          this.event.$emit('versionCheck', versionData)
        } else {
          this.event.$emit('alert', this.$t('menu.update'), this.$t('menu.noUpdate'))
        }
      } else {
        throw new Error(err)
      }
    }) */
  }
  relaunch () {
    this.playSe(this.enterSe)
    remote.app.relaunch({ args: ['.'] })
    remote.app.exit(0)
  }
  calculator () {
    this.playSe(this.enterSe)
    this.event.$emit('openCal')
  }
  exit () {
    remote.app.exit(0)
    this.playSe(this.cancelSe)
  }
  async cacheClear () {
    this.playSe(this.enterSe)
    const dataDir = getPath('./data')
    const files = fs.readdirSync(dataDir)
    const deleteItem = []
    for (let i = 0; i < files.length; i++) {
      if (!new RegExp(`${this.resVer}`).test(files[i])) deleteItem.push(getPath(`./data/${files[i]}`))
    }
    for (let i = 0; i < deleteItem.length; i++) {
      remove(deleteItem[i])
    }
    if (deleteItem.length) this.event.$emit('alert', this.$t('menu.cacheClear'), this.$t('menu.cacheClearSuccess'))
    else this.event.$emit('alert', this.$t('menu.cacheClear'), this.$t('menu.noCache'))
  }

}
