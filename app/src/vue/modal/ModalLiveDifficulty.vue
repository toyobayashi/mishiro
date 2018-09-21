<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div :style="{ width: modalWidth }" v-if="visible">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{live.fileName.split('-')[1].split('.')[0]}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <form>
          <div>
            <!-- <label>{{$t("menu.lang")}}</label> -->
            <div style="display:flex;justify-content:space-between">
              <InputRadio text="Debut" value="1" v-model="difficulty" lable-id="d_1"/>
              <InputRadio text="Regular" value="2" v-model="difficulty" lable-id="d_2"/>
              <InputRadio text="Pro" value="3" v-model="difficulty" lable-id="d_3"/>
              <InputRadio text="Master" value="4" v-model="difficulty" lable-id="d_4"/>
            </div>
          </div>
        </form>
        
      </div>
      <div class="modal-footer">
        <button type="button" class="cgss-btn cgss-btn-ok" @click="start">{{$t("live.start")}}</button>
        <button type="button" class="cgss-btn cgss-btn-default margin-left-50" @click="close">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script lang="ts">
import * as url from 'url'
import InputRadio from '../component/InputRadio.vue'
import { ipcRenderer, remote, Event } from 'electron'
import getPath from '../../ts/renderer/get-path'
import modalMixin from '../../ts/renderer/modal-mixin'
import Component, { mixins } from 'vue-class-component'
const BrowserWindow = remote.BrowserWindow
const { scoreDir, liveDir } = getPath

@Component({
  components: {
    InputRadio
  }
})
export default class extends mixins(modalMixin) {

  difficulty: string = '4'
  live: any = {}

  start () {
    this.playSe(this.enterSe)
    ipcRenderer.send(
      'game',
      scoreDir(this.live.score), // scoreFile
      this.difficulty, // difficulty
      this.live.bpm, // bpm
      liveDir(this.live.fileName) // audioFile
    )
  }
  mounted () {
    this.$nextTick(() => {
      ipcRenderer.on('game', (_event: Event, obj: { src: string; bpm: number; score: any[][]; fullCombo: number;}) => {
        const focusedWindow = BrowserWindow.getFocusedWindow()
        if (!focusedWindow) return
        this.event.$emit('gameStart')
        this.event.$emit('pauseBgm')
        const windowID = focusedWindow.id

        let win = new BrowserWindow({
          width: 1296,
          height: 759,
          minWidth: 1296,
          minHeight: 759,
          maxWidth: 1296,
          maxHeight: 759,
          backgroundColor: '#000000'
        })

        win.loadURL(url.format({
          pathname: getPath('./public/game.html'),
          protocol: 'file:',
          slashes: true
        }))

        win.webContents.on('did-finish-load', function () {
          win.webContents.send('start', obj, windowID)
        })

        this.visible = false
      })
      this.event.$on('game', (live: any) => {
        this.difficulty = '4'
        this.live = live
        this.show = true
        this.visible = true
      })
      this.event.$on('enterKey', (block: string) => {
        if (block === 'live' && this.visible) {
          this.start()
        }
      })
    })
  }
}
</script>
