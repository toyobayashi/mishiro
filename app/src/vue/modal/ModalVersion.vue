<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div style="width:800px" v-show="visible">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{$t("menu.update")}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <ProgressBar class="cgss-progress-load" :percent="updateProgress"/>
        <table class="table-bordered" border="1">
          <tr>
            <td width="25%">{{$t("menu.version")}}</td>
            <td width="75%">{{versionData.version}}</td>
          </tr>
          <tr>
            <td>{{$t("menu.commit")}}</td>
            <td>{{versionData.commit}}</td>
          </tr>
          <tr>
            <td>{{$t("menu.description")}}</td>
            <td class="markdown-body" v-html="versionData.description"></td>
          </tr>
        </table>
      </div>
      <div class="modal-footer">
        <button type="button" class="cgss-btn-lg cgss-btn-lg-ok" :disabled="btnDisabled" @click="showRepo">{{$t("menu.release")}}</button>
        <button type="button" class="cgss-btn cgss-btn-default margin-left-50" @click="close">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script lang="ts">
import { createWriteStream, existsSync } from 'fs-extra'
import { shell, remote } from 'electron'
import modalMixin from '../../ts/renderer/modal-mixin'
import ProgressBar from '../component/ProgressBar.vue'
import getPath from '../../ts/renderer/get-path'
import { ProgressInfo } from 'mishiro-core'
import { unzip } from 'zauz'
import * as http from 'http'
import * as https from 'https'
import Component, { mixins } from 'vue-class-component'

const { downloadDir } = getPath

function download (url: string, p: string, onData?: (prog: any) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    let protocol: any = /^https:/.exec(url) ? https : http

    protocol.get(url, (res1: http.IncomingMessage) => {
      protocol = /^https:/.exec(res1.headers.location as string) ? https : http

      protocol
        .get(res1.headers.location, (res2: http.IncomingMessage) => {
          const total = parseInt(res2.headers['content-length'] as any, 10)
          let completed = 0
          res2.pipe(createWriteStream(p))
          res2.on('data', data => {
            completed += data.length
            if (onData) onData({ loading: 100 * completed / total })
          })
          res2.on('error', reject)
          res2.on('end', resolve)
        })
        .on('error', reject)
    })
    .on('error', reject)
  })
}

@Component({
  components: {
    ProgressBar
  }
})
export default class extends mixins(modalMixin) {

  versionData: any = {}
  updateProgress: number = 0
  btnDisabled: boolean = false

  async showRepo () {
    if (this.versionData.patchUrl) {
      this.btnDisabled = true
      const patchFile = downloadDir(`mishiro-v${this.versionData.version}-patch.zip`)
      if (!existsSync(patchFile)) {
        try {
          await download(this.versionData.patchUrl, patchFile, (prog: ProgressInfo) => { this.updateProgress = prog.loading })
          this.updateProgress = 99.99
        } catch (err) {
          this.btnDisabled = false
          this.updateProgress = 0
          this.event.$emit('alert', this.$t('home.errorTitle'), err.message)
        }
      }
      // this.btnDisabled = false
      // this.updateProgress = 0
      // shell.openExternal(patchFile)
      unzip(patchFile, getPath(), (err) => {
        if (err) {
          this.event.$emit('alert', this.$t('home.errorTitle'), err.message)
        } else {
          this.btnDisabled = false
          this.updateProgress = 0
          remote.app.relaunch({ args: ['.'] })
          remote.app.exit(0)
        }
      })
    } else if (this.versionData.exeUrl) {
      shell.openExternal(this.versionData.exeUrl)
    } else if (this.versionData.zipUrl) {
      shell.openExternal(this.versionData.zipUrl)
    } else {
      shell.openExternal('https://github.com/toyobayashi/mishiro/releases')
    }
    this.playSe(this.enterSe)

  }

  mounted () {
    this.$nextTick(() => {
      this.event.$on('versionCheck', (versionData: any) => {
        this.show = true
        this.visible = true
        this.versionData = versionData
      })
    })
  }
}
</script>

<style scoped>
.markdown-body {
  word-wrap: break-word;
}
</style>
