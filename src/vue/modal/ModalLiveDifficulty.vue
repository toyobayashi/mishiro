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

<script>
import url from 'url'
import modalMixin from '../../js/renderer/modal-mixin.js'
import InputRadio from '../component/InputRadio.vue'
import { ipcRenderer, remote } from 'electron'
import getPath from '../../js/common/get-path.js'
const BrowserWindow = remote.BrowserWindow
export default {
  mixins: [modalMixin],
  components: {
    InputRadio
  },
  data () {
    return {
      difficulty: '4',
      live: {}
    }
  },
  methods: {
    start () {
      this.playSe(this.enterSe)
      ipcRenderer.send(
        'game',
        getPath(`./public/asset/score/${this.live.score}`), // scoreFile
        this.difficulty, // difficulty
        this.live.bpm, // bpm
        getPath(`./public/asset/sound/live/${this.live.fileName}`) // audioFile
      )
    }
  },
  mounted () {
    this.$nextTick(() => {
      ipcRenderer.on('game', (event, obj) => {
        console.log(obj)
        this.event.$emit('pauseBgm')
        const windowID = BrowserWindow.getFocusedWindow().id

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
      })
      this.event.$on('game', (live) => {
        this.difficulty = '4'
        this.live = live
        this.show = true
        this.visible = true
      })
      this.event.$on('enterKey', block => {
        if (block === 'live' && this.visible) {
          this.start()
        }
      })
    })
  }
}
</script>
