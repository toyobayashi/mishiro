<template>
<div>
  <TheLiveGauge :hp="liveResult.hp"/>
  <TheCombo :combo="liveResult.combo"/>
</div>
</template>

<script>
import TheCombo from './component/TheCombo.vue'
import TheLiveGauge from './component/TheLiveGauge.vue'
import { liveResult } from '../js/renderer/game.js'
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

<style src="../css/game.css">
</style>

