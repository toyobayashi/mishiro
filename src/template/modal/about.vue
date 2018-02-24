<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div :style="{ width: modalWidth }" v-show="visible">
      <div class="modal-header">
        <title-dot v-once></title-dot>
        <h4 class="modal-title">{{$t("menu.about")}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <table class="table-bordered" border="1">
          <tr>
            <td width="25%">{{$t("menu.appname")}}</td>
            <td width="75%">{{remote.app.getName()}}</td>
          </tr>
          <tr>
            <td>{{$t("menu.appver")}}</td>
            <td>{{remote.app.getVersion()}}</td>
          </tr>
          <tr>
            <td>Electron</td>
            <td>{{process.versions.electron}}</td>
          </tr>
          <tr>
            <td>Chromium</td>
            <td>{{process.versions.chrome}}</td>
          </tr>
          <tr>
            <td>Node</td>
            <td>{{process.versions.node}}</td>
          </tr>
          <tr>
            <td>Architecture</td>
            <td>{{process.arch}}</td>
          </tr>
          <tr>
            <td>{{$t("menu.description")}}</td>
            <td>{{$t("menu.descCon")}}</td>
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

<script>
import { remote, shell } from 'electron'
import modalMixin from '../../js/renderer/modalMixin.js'
export default {
  mixins: [modalMixin],
  data () {
    return {
      remote,
      process
    }
  },
  methods: {
    showRepo () {
      shell.openExternal('https://github.com/toyobayashi/mishiro')
      this.playSe(this.enterSe)
    }
  },
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

