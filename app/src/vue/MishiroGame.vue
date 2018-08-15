<template>
<div style="position:fixed;width:100%;height:100%">
  <img :src="'./img.asar/bg_live_4004.png'" class="img-middle">
  <div style="background: rgba(0,0,0,0.5);position:fixed;width:100%;height:100%"></div>
  <TheLiveGauge :hp="liveResult.hp"/>
  <TheCombo :combo="liveResult.combo"/>
  <canvas class="canvas canvas-center" id="iconBar" width="1280" height="720"></canvas>
  <canvas class="canvas canvas-center" id="live" width="1280" height="720"></canvas>
</div>
</template>

<script>
import TheCombo from './component/TheCombo.vue'
import TheLiveGauge from './component/TheLiveGauge.vue'
import { liveResult } from '../ts/renderer/game'
export default {
  components: {
    TheCombo,
    TheLiveGauge
  },
  data () {
    return {
      liveResult
    }
  }
}
</script>

<style>
*{
  margin: 0;
  padding: 0;
}
@font-face{
  font-family:'CGSS-B';
  src:url(./font.asar/FRB.otf)
}
.canvas {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.canvas-middle {
  width: 100%;
}

.canvas-center {
  height: 100%;
}

.img-middle {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: -1000;
}

.img-center {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 100%;
  z-index: -1000;
}
</style>
