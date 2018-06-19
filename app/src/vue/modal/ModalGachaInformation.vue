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
          <tr v-for="line in table">
            <td width="18%" :colspan="line[0].colspan || 1">{{line[0].text}}</td>
            <td width="32%" :colspan="line[1].colspan || 1">{{line[1].text}}</td>
            <td width="18%" v-if="line[2]">{{line[2].text}}</td>
            <td width="32%" v-if="line[3]">{{line[3].text}}</td>
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

  get gachaData (): any {
    return this.master.gachaData ? this.master.gachaData : {}
  }

  get table () {
    return [
      [
        { text: this.$t('gacha.id') },
        { text: this.gachaData.id, colspan: 3 }
      ],
      [
        { text: this.$t('gacha.name') },
        { text: this.gachaData.name, colspan: 3 }
      ],
      [
        { text: this.$t('gacha.discription') },
        { text: this.gachaData.dicription, colspan: 3 }
      ],
      [
        { text: this.$t('gacha.endDate') },
        { text: this.gachaData.end_date + '(JST)', colspan: 3 }
      ],
      [
        { text: this.$t('gacha.r') },
        { text: `${this.gachaData.count ? this.gachaData.count.R : 0} (${(this.gachaData.count ? this.gachaData.count.fes : false) ? '82.00%' : '85.00%'})` },
        { text: this.$t('gacha.get') },
        { text: `${this.info.r} (${this.info.r > 0 ? (100 * this.info.r / this.info.total).toFixed(2) : '0.00'}%)` }
      ],
      [
        { text: this.$t('gacha.sr') },
        { text: `${this.gachaData.count ? this.gachaData.count.SR : 0} (12.00%)` },
        { text: this.$t('gacha.get') },
        { text: `${this.info.sr} (${this.info.sr > 0 ? (100 * this.info.sr / this.info.total).toFixed(2) : '0.00'}%)` }
      ],
      [
        { text: this.$t('gacha.ssr') },
        { text: `${this.gachaData.count ? this.gachaData.count.SSR : 0} (${(this.gachaData.count ? this.gachaData.count.fes : false) ? '6.00%' : '3.00%'})` },
        { text: this.$t('gacha.get') },
        { text: `${this.info.ssr} (${this.info.ssr > 0 ? (100 * this.info.ssr / this.info.total).toFixed(2) : '0.00'}%)` }
      ],
      [
        { text: this.$t('gacha.cost') },
        { text: this.info.costStarJewel, colspan: 3 }
      ]
    ]
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
