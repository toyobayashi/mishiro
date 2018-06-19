<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div :style="{ width: modalWidth }" v-show="visible">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{$t("gacha.history")}}</h4>
      </div>
      <div class="modal-body" id="gachaHistoryBody" :style="{ maxHeight: bodyMaxHeight }">
        <div v-if="list.length">
          <span v-for="l in list" :class="{ 'sr-color': l ? l.rarity == 5 : false, 'ssr-color': l ? l.rarity == 7 : false }" @click="showCard(l)">({{l ? l.id : ""}}) {{l ? l.name : ""}}</span>
        </div>
        <div v-else>{{$t("idol.nashi")}}</div>
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

  modalWidth: string = '700px'
  list: any[] = []

  showCard (card: any) {
    this.playSe(this.enterSe)
    this.event.$emit('showCard', card)
  }

  mounted () {
    this.$nextTick(() => {
      this.event.$on('showHistory', (list: any[]) => {
        this.list = list
        this.show = true
        this.visible = true
      })
    })
  }
}
</script>

<style>
#gachaHistoryBody{
  overflow: auto;
}
#gachaHistoryBody span{
  cursor: pointer;
  display: block;
  height: 25px;
  line-height: 25px;
}
#gachaHistoryBody span.sr-color{
  color: #e6cd07;
}
#gachaHistoryBody span.ssr-color{
  color: rgb(217, 112, 201);
}
</style>
