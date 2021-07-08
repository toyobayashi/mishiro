<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div v-show="visible" :style="{ width: modalWidth }">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{title}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }" v-html="body"></div>
      <div class="modal-footer">
        <button v-if="additionalBtn.text" type="button" class="cgss-btn cgss-btn-ok" @click="additionalBtn.cb(title, body)">{{additionalBtn.text}}</button>
        <button v-if="additionalBtn2.text" type="button" class="cgss-btn cgss-btn-ok" @click="additionalBtn2.cb(title, body)">{{additionalBtn2.text}}</button>
        <button type="button" class="cgss-btn cgss-btn-default" @click="close">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script lang="ts">
import modalMixin from '../../ts/renderer/modal-mixin'
import Component, { mixins } from 'vue-class-component'

interface AdditionalBtn {
  text: string
  cb: ((title: string, body: string) => void) | null
}

@Component
export default class extends mixins(modalMixin) {
  title: string = ''
  body: string = ''
  additionalBtn: AdditionalBtn = {
    text: '',
    cb: null
  }

  additionalBtn2: AdditionalBtn = {
    text: '',
    cb: null
  }

  afterLeave () {
    this.show = false
    this.title = ''
    this.body = ''
    this.additionalBtn.text = ''
    this.additionalBtn.cb = null
    this.additionalBtn2.text = ''
    this.additionalBtn2.cb = null
    this.modalWidth = '600px'
  }

  mounted () {
    this.$nextTick(() => {
      this.event.$on('alert', (title: string, body: string, width?: number, additionalBtn?: AdditionalBtn, additionalBtn2?: AdditionalBtn) => {
        if (width) this.modalWidth = width + 'px'
        if (additionalBtn) {
          this.additionalBtn.text = additionalBtn.text
          this.additionalBtn.cb = additionalBtn.cb
        }
        if (additionalBtn2) {
          this.additionalBtn2.text = additionalBtn2.text
          this.additionalBtn2.cb = additionalBtn2.cb
        }
        this.title = title
        this.body = body
        this.show = true
        this.visible = true
      })
    })
  }
}
</script>

<style>
.modal {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.modal > div {
  border: 2px solid rgba(0, 0, 0, 1);
  border-radius: 10px;
  font-family: "CGSS-B";
  font-size: 20px;
}
.modal-header {
  padding: 18px;
  border-bottom: 1px solid #000;
  height: 64px;
  background: linear-gradient(180deg, #f0f0f0, #d0d0d0);
  border-radius: 10px 10px 0 0;
}
.modal-title {
  margin: 0;
  line-height: 27px;
  font-size: 20px;
  height: 27px;
  display: inline-block;
  position: relative;
  bottom: 5px;
}
.modal-body {
  position: relative;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.87);
  color: #fff;
  overflow: auto;
}
.modal-footer {
  padding: 15px;
  border-top: 1px solid #000;
  background: linear-gradient(180deg, #f0f0f0, #d0d0d0);
  height: 103px;
  border-radius: 0 0 10px 10px;
  /* text-align: center; */
  display: flex;
  justify-content: space-around;
  align-content: center;
}
</style>
