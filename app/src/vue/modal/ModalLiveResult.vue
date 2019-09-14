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
          <tr v-for="line in table">
            <td width="25%">{{line[0]}}</td>
            <td width="75%">{{line[1]}}</td>
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

<script lang="ts">
import modalMixin from '../../ts/renderer/modal-mixin'
import Component, { mixins } from 'vue-class-component'
@Component
export default class extends mixins(modalMixin) {
  liveResult: any = {}

  get table () {
    return [
      ['LIVE', this.liveResult.name],
      ['PERFECT', this.liveResult.perfect],
      ['GREAT', this.liveResult.great],
      ['NICE', this.liveResult.nice],
      ['BAD', this.liveResult.bad],
      ['MISS', this.liveResult.miss],
      ['COMBO', this.liveResult.maxCombo + ' / ' + this.liveResult.fullCombo]
    ]
  }

  close () {
    this.playSe(this.cancelSe)
    this.visible = false
    this.event.$emit('playBgm')
  }

  mounted () {
    this.$nextTick(() => {
      this.event.$on('showLiveResult', (liveResult: any) => {
        this.liveResult = liveResult
        this.show = true
        this.visible = true
      })
    })
  }
}
</script>
