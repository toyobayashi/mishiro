<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div :style="{ width: '800px' }" v-show="visible">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{$t("menu.about")}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <table class="table-bordered" border="1">
          <tr><td width="25%">{{$t('menu.appname')}}</td><td width="75%">{{app.getName()}}</td></tr>
          <tr><td width="25%">{{$t('menu.appver')}}</td><td width="75%">{{app.getVersion()}}</td></tr>
          <tr><td width="25%">{{$t('menu.commitHash')}}</td><td width="75%">{{commit}}</td></tr>
          <tr><td width="25%">{{$t('menu.commitDate')}}</td><td width="75%">{{commitDate}}</td></tr>
          <tr><td width="25%">Electron</td><td width="75%">{{versions.electron}}</td></tr>
          <tr><td width="25%">Chrome</td><td width="75%">{{versions.chrome}}</td></tr>
          <tr><td width="25%">Node</td><td width="75%">{{versions.node}}</td></tr>
          <tr><td width="25%">{{$t('menu.arch')}}</td><td width="75%">{{arch}}</td></tr>
          <tr><td width="25%">{{$t('menu.description')}}</td><td width="75%">{{$t('menu.descCon')}}</td></tr>
        </table>
      </div>
      <div class="modal-footer">
        <button type="button" class="cgss-btn cgss-btn-ok" @click="showRepo">Github</button>
        <button type="button" class="cgss-btn cgss-btn-default margin-left-50" @click="close">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script lang="ts">
import { remote, shell } from 'electron'
import modalMixin from '../../ts/renderer/modal-mixin'
import Component, { mixins } from 'vue-class-component'

declare function __non_webpack_require__ (module: string): any

const execSync = remote.getGlobal('execSync')

@Component
export default class extends mixins(modalMixin) {

  app = remote.app
  versions = process.versions
  arch = process.arch
  commit = process.env.NODE_ENV === 'production' ? __non_webpack_require__('../package.json')._commit : execSync('git rev-parse HEAD', { cwd: require('path').join(__dirname, '..') }).toString().replace(/[\r\n]/g, '')
  commitDate = process.env.NODE_ENV === 'production' ? __non_webpack_require__('../package.json')._commitDate : new Date((execSync('git log -1', { cwd: require('path').join(__dirname, '..') }).toString().match(/Date:\s*(.*?)\n/) as any)[1]).toISOString()

  showRepo () {
    shell.openExternal('https://github.com/toyobayashi/mishiro')
    this.playSe(this.enterSe)
  }

  mounted () {
    this.$nextTick(() => {
      this.event.$on('showAbout', () => {
        this.show = true
        this.visible = true
      })
    })
  }
}
</script>
