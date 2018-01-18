<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div class="dialog" v-show="visible">
      <div class="modal-header">
        <span class="title-dot">
        </span><span class="title-dot">
        </span><span class="title-dot"></span>
        <h4 class="modal-title">{{$t("gacha.history")}}</h4>
      </div>
      <div class="modal-body" id="gachaHistoryBody" ref="gachaHistoryBody">
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

<script>
export default {
  data () {
    return {
      show: false,
      visible: false,
      list: []
    }
  },
  methods: {
    close () {
      this.playSe(this.cancelSe)
      this.visible = false
    },
    afterLeave () {
      this.show = false
    },
    showCard (card) {
      this.playSe(this.enterSe)
      this.event.$emit('showCard', card)
    }
  },
  mounted () {
    this.$nextTick(() => {
      let gachaHistoryBody = this.$refs.gachaHistoryBody
      gachaHistoryBody.style.maxHeight = window.innerHeight - 267 + 'px'
      window.addEventListener('resize', () => {
        gachaHistoryBody.style.maxHeight = window.innerHeight - 267 + 'px'
      }, false)
      this.event.$on('showHistory', (list) => {
        this.list = list
        this.show = true
        this.visible = true
      })
      this.event.$on('escKey', () => {
        this.close()
      })
    })
  }
}
</script>

<style>
.dialog{
  width: 600px;
}
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
