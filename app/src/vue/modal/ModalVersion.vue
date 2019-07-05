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
        <button type="button" class="cgss-btn cgss-btn-default margin-left-50" @click="cancel">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script lang="ts">
import { shell } from 'electron'
import modalMixin from '../../ts/renderer/modal-mixin'
import ProgressBar from '../component/ProgressBar.vue'

import Component, { mixins } from 'vue-class-component'
import * as marked from 'marked'

@Component({
  components: {
    ProgressBar
  }
})
export default class extends mixins(modalMixin) {

  versionData: any = {}
  updateProgress: number = 0
  btnDisabled: boolean = false

  cancel () {
    this.updater.abort()
    this.close()
  }

  async showRepo () {
    this.playSe(this.enterSe)
    if (this.versionData.appZipUrl && process.env.NODE_ENV === 'production') {
      this.btnDisabled = true
      try {
        const result = await this.updater.download((status: any) => {
          this.updateProgress = status.loading
        })
        if (result) {
          this.updater.relaunch()
        } else {
          this.btnDisabled = false
          this.updateProgress = 0
        }
      } catch (err) {
        this.btnDisabled = false
        this.event.$emit('alert', this.$t('home.errorTitle'), err.message)
      }
    } else if (this.versionData.exeUrl) {
      shell.openExternal(this.versionData.exeUrl)
    } else if (this.versionData.zipUrl) {
      shell.openExternal(this.versionData.zipUrl)
    } else {
      shell.openExternal('https://github.com/toyobayashi/mishiro/releases')
    }

  }

  mounted () {
    this.$nextTick(() => {
      this.event.$on('versionCheck', (versionData: any) => {
        this.show = true
        this.visible = true
        versionData.description = marked(versionData.release.body)
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
