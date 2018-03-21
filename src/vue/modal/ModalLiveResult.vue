<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div :style="{ width: modalWidth }" v-show="visible">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{$t("live.liveResult")}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <table class="table-bordered" border="1">
          <tr>
            <td width="25%">LIVE</td>
            <td width="75%">{{liveResult.name}}</td>
          </tr>
          <tr>
            <td>PERFECT</td>
            <td>{{liveResult.perfect}}</td>
          </tr>
          <tr>
            <td>GREAT</td>
            <td>{{liveResult.great}}</td>
          </tr>
          <tr>
            <td>NICE</td>
            <td>{{liveResult.nice}}</td>
          </tr>
          <tr>
            <td>BAD</td>
            <td>{{liveResult.bad}}</td>
          </tr>
          <tr>
            <td>MISS</td>
            <td>{{liveResult.miss}}</td>
          </tr>
          <tr>
            <td>COMBO</td>
            <td>{{liveResult.maxCombo + ' / ' + liveResult.fullCombo}}</td>
          </tr>
        </table>
      </div>
      <div class="modal-footer">
        <button type="button" class="cgss-btn cgss-btn-default" @click="close">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script>
import modalMixin from '../../js/renderer/modal-mixin.js'
export default {
  mixins: [modalMixin],
  data () {
    return {
      liveResult: {}
    }
  },
  methods: {
    close () {
      this.playSe(this.cancelSe)
      this.visible = false
      this.event.$emit('playBgm')
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.event.$on('showLiveResult', liveResult => {
        this.liveResult = liveResult
        this.show = true
        this.visible = true
      })
    })
  }
}
</script>

