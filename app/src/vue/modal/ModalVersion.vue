<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div style="width:800px" v-show="visible">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{$t("menu.update")}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
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
        <button type="button" class="cgss-btn-lg cgss-btn-lg-ok" @click="showRepo">{{$t("menu.release")}}</button>
        <button type="button" class="cgss-btn cgss-btn-default margin-left-50" @click="close">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script lang="ts">
import { shell } from 'electron'
import modalMixin from '../../ts/renderer/modal-mixin'
import Component, { mixins } from 'vue-class-component'
@Component
export default class extends mixins(modalMixin) {

  versionData: any = {}

  showRepo () {
    if (this.versionData.exeUrl) {
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
