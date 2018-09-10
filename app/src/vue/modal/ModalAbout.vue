<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div :style="{ width: modalWidth }" v-show="visible">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{$t("menu.about")}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <table class="table-bordered" border="1">
          <tr v-for="line in lines" :key="line.key">
            <td width="25%">{{line.key}}</td>
            <td width="75%">{{line.value}}</td>
          </tr>
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

@Component
export default class extends mixins(modalMixin) {

  data () {
    return {
      lines: [
        { key: this.$t('menu.appname'), value: remote.app.getName() },
        { key: this.$t('menu.appver'), value: remote.app.getVersion() },
        { key: 'Electron', value: process.versions.electron },
        { key: 'Chromium', value: process.versions.chrome },
        { key: 'Node', value: process.versions.node },
        { key: 'Architecture', value: process.arch },
        { key: this.$t('menu.description'), value: this.$t('menu.descCon') }
      ]
    }
  }

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
