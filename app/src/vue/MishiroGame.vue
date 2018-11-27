<template>
<div style="position:fixed;width:100%;height:100%">
  <img :src="'../../asset/img.asar/bg_live_4004.png'" class="img-middle">
  <div style="background: rgba(0,0,0,0.5);position:fixed;width:100%;height:100%"></div>
  <TheLiveGauge :hp="liveResult.hp"/>
  <TheCombo :combo="liveResult.combo"/>
  <canvas class="canvas canvas-center" id="iconBar" width="1280" height="720"></canvas>
  <canvas class="canvas canvas-center" id="live" width="1280" height="720"></canvas>
</div>
</template>

<script lang="ts">
import TheCombo from './component/TheCombo.vue'
import TheLiveGauge from './component/TheLiveGauge.vue'
import { liveResult, Game } from '../ts/renderer/game'
import { Vue, Component } from 'vue-property-decorator'
import { ipcRenderer, Event } from 'electron'

@Component({
  components: {
    TheCombo,
    TheLiveGauge
  }
})
export default class extends Vue {
  liveResult = liveResult
  mounted () {
    this.$nextTick(() => {
      ipcRenderer.once('start', (_event: Event, song: any, fromWindowId: number) => {
        Game.start(song, fromWindowId)
      })
      Game.init()
    })
  }
}
</script>
