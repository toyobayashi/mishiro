<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div :style="{ width: modalWidth }" v-show="visible">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{$t("gacha.information")}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <table class="table-bordered" border="1">
          <tr>
            <td colspan="1">{{$t("gacha.id")}}</td>
            <td colspan="3">{{gachaData.id}}</td>
          </tr>
          <tr>
            <td colspan="1">{{$t("gacha.name")}}</td>
            <td colspan="3">{{gachaData.name}}</td>
          </tr>
          <tr>
            <td colspan="1">{{$t("gacha.discription")}}</td>
            <td colspan="3">{{gachaData.dicription}}</td>
          </tr>
          <tr>
            <td colspan="1">{{$t("gacha.endDate")}}</td>
            <td colspan="3">{{gachaData.end_date}} (JST)</td>
          </tr>
          <tr>
            <td width="18%">{{$t("gacha.r")}}</td>
            <td width="32%">{{gachaData.count ? gachaData.count.R : 0}} ({{(gachaData.count ? gachaData.count.fes : false) ? "82.00%" : "85.00%"}})</td>
            <td width="18%">{{$t("gacha.get")}}</td>
            <td width="32%">{{info.r}} ({{info.r > 0 ? (100 * info.r / info.total).toFixed(2) : "0.00"}}%)</td>
          </tr>
          <tr>
            <td>{{$t("gacha.sr")}}</td>
            <td>{{gachaData.count ? gachaData.count.SR : 0}} (12.00%)</td>
            <td>{{$t("gacha.get")}}</td>
            <td>{{info.sr}} ({{info.sr > 0 ? (100 * info.sr / info.total).toFixed(2) : "0.00"}}%)</td>
          </tr>
          <tr>
            <td>{{$t("gacha.ssr")}}</td>
            <td>{{gachaData.count ? gachaData.count.SSR : 0}} ({{(gachaData.count ? gachaData.count.fes : false) ? "6.00%" : "3.00%"}})</td>
            <td>{{$t("gacha.get")}}</td>
            <td>{{info.ssr}} ({{info.ssr > 0 ? (100 * info.ssr / info.total).toFixed(2) : "0.00"}}%)</td>
          </tr>
          <tr>
            <td colspan="1">{{$t("gacha.cost")}}</td>
            <td colspan="3">{{info.costStarJewel}}</td>
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
import { Prop } from 'vue-property-decorator'
import { MasterData } from '../../ts/main/on-master-read'
@Component
export default class extends mixins(modalMixin) {

  info: any = {}

  @Prop({ default: (() => ({})), type: Object }) master: MasterData

  get gachaData () {
    return this.master.gachaData ? this.master.gachaData : {}
  }

  mounted () {
    this.$nextTick(() => {
      this.event.$on('showInformation', (info: any) => {
        this.info = info
        this.show = true
        this.visible = true
      })
    })
  }
}
</script>
