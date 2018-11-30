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
              <InputRadio text="Debut" value="1" v-model="difficulty" lable-id="s_1"/>
              <InputRadio text="Regular" value="2" v-model="difficulty" lable-id="s_2"/>
              <InputRadio text="Pro" value="3" v-model="difficulty" lable-id="s_3"/>
              <InputRadio text="Master" value="4" v-model="difficulty" lable-id="s_4"/>
              <InputRadio v-if="hasMasterPlus" text="Master+" value="5" v-model="difficulty" lable-id="s_5"/>
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
import { ipcRenderer, remote, Event, BrowserWindow } from 'electron'
import getPath from '../../ts/renderer/get-path'
import modalMixin from '../../ts/renderer/modal-mixin'
import Component, { mixins } from 'vue-class-component'
const { scoreDir, liveDir } = getPath

@Component({
  components: {
    InputRadio
  }
})
export default class extends mixins(modalMixin) {

  difficulty: string = '4'
  live: any = {}
  hasMasterPlus: boolean

  start () {
    this.playSe(this.enterSe)
    ipcRenderer.send(
      'score',
      scoreDir(this.live.score), // scoreFile
      this.difficulty, // difficulty
      this.live.bpm, // bpm
      liveDir(this.live.fileName) // audioFile
    )
  }
  mounted () {
    this.$nextTick(() => {
      ipcRenderer.on('score', (_event: Event) => {

        this.event.$emit('gameStart')
        this.event.$emit('pauseBgm')
        // const windowID = ipcRenderer.sendSync('mainWindowId')

        let win: BrowserWindow | null = new remote.BrowserWindow({
          width: 1296,
          height: 759,
          // minWidth: 1296,
          // minHeight: 759,
          // maxWidth: 1296,
          // maxHeight: 759,
          // parent: remote.BrowserWindow.fromId(windowID),
          backgroundColor: '#000000'
        })

        if (process.env.NODE_ENV === 'production') {
          win.loadURL(url.format({
            pathname: getPath('./public/score.html'),
            protocol: 'file:',
            slashes: true
          }))
        } else {
          const { devServerHost, devServerPort, publicPath } = require('../../../script/config.json')
          win.loadURL(`http://${devServerHost}:${devServerPort}${publicPath}score.html`)
          win.webContents.openDevTools()
        }

        win.on('close', () => {
          win = null
        })

        this.visible = false
      })
      this.event.$on('score', (live: any, hasMasterPlus: boolean) => {
        this.difficulty = '4'
        this.live = live
        this.show = true
        this.visible = true
        this.hasMasterPlus = hasMasterPlus
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
