<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div :style="{ width: '700px' }" v-if="visible">
      <div class="modal-header">
        <StaticTitleDot v-once/>
        <h4 class="modal-title">{{$t("menu.option")}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <form>
          <div class="option-line">
            <label>{{$t("menu.lang")}}</label>
            <div class="option-input">
              <InputRadio :text="$t('i18n.chinese')" value="zh" v-model="lang" lable-id="razh"/>
              <InputRadio :text="$t('i18n.japanese')" value="ja" v-model="lang" lable-id="raja"/>
              <InputRadio :text="$t('i18n.english')" value="en" v-model="lang" lable-id="raen"/>
            </div>
          </div>
          <div class="margin-top-10 option-line">
            <label>{{$t("menu.getCardFrom")}}</label>
            <div class="option-input">
              <InputRadio :text="$t('menu.official')" value="default" v-model="card" lable-id="gcfd"/>
              <InputRadio :text="$t('menu.kirara')" value="kirara" v-model="card" lable-id="gcfk"/>
            </div>
          </div>
          <div class="margin-top-10 option-line">
            <label>{{$t("menu.lrcEncoding")}}</label>
            <div class="option-input">
              <InputRadio text="utf8" value="utf8" v-model="lrcEncoding" lable-id="utf8"/>
              <InputRadio text="cp932" value="Windows932" v-model="lrcEncoding" lable-id="Windows932"/>
              <InputRadio text="cp936" value="Windows936" v-model="lrcEncoding" lable-id="Windows936"/>
              <!-- <InputRadio text="cp949" value="Windows949" v-model="lrcEncoding" lable-id="Windows949"/>
              <InputRadio text="cp950" value="Windows950" v-model="lrcEncoding" lable-id="Windows950"/> -->
            </div>
          </div>
          <div class="margin-top-10 option-line">
            <label>{{$t("menu.resVer")}}</label>
            <InputText class="option-input" :placeholder="latestResVer > 0 ? `10012760 ≤ ${$t('menu.resVer')} ≤ ${latestResVer}` : ''" v-model="resVer" />
          </div>
          <!-- <div class="margin-top-10">
            <label>{{$t("menu.gacha")}}</label>
            <InputText class="option-input" :placeholder="`30001 ≤ ${$t('menu.gacha')} ≤ ${gachaNow.id}`" v-model="gachaId" />
          </div> -->
          <div class="margin-top-10 option-line">
            <label>{{$t("menu.event")}}</label>
            <InputText class="option-input" :placeholder="$t('menu.eventPlacehoder') + 'bgm_event_ID'" v-model="eventId" />
          </div>
          <div class="margin-top-10 option-line">
            <label>{{$t("menu.background")}}</label>
            <InputText class="option-input" :placeholder="$t('menu.backPlacehoder')" v-model="backgroundId" />
          </div>
          <div class="margin-top-10 option-line">
            <label>{{$t("menu.account")}}</label>
            <InputText class="option-input" placeholder="123456789:987654321:0a1b2c3d-5c6d-4e7f-8a9b-0e1f2a3b4c5d" v-model="account" />
          </div>
          <div class="margin-top-10 option-line">
            <label>{{$t("menu.proxy")}}</label>
            <InputText class="option-input" v-model="proxy" />
          </div>
        </form>
        <div class="batch-area" v-if="showBatchDownloadFeature">
          <div class="batch-btn">
            <button type="button" v-if="!batchDownloading" class="cgss-btn cgss-btn-ok" @click="batchDownload">{{$t("menu.batchStart")}}</button>
            <button type="button" v-else class="cgss-btn cgss-btn-default" @click="batchStop">{{$t("menu.batchStop")}}</button>
          </div>
          <div class="batch-prog">
            <div class="status">
              <div>{{$store.state.batchStatus.name}}</div>
              <div>{{$store.state.batchStatus.status}}</div>
            </div>
            <ProgressBar class="cgss-progress-load" :percent="$store.state.batchStatus.curprog"/>
            <div class="status">
              <div></div>
              <div>{{$store.state.batchStatus.status2}}</div>
            </div>
            <ProgressBar class="cgss-progress-load" :percent="$store.state.batchStatus.totalprog"/>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="cgss-btn cgss-btn-ok" @click="save">{{$t("menu.save")}}</button>
        <button type="button" class="cgss-btn cgss-btn-default margin-left-50" @click="close">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script lang="ts">
import modalMixin from '../../ts/renderer/modal-mixin'
import configurer from '../../ts/renderer/config'
import InputRadio from '../component/InputRadio.vue'
import InputText from '../component/InputText.vue'
import Component, { mixins } from 'vue-class-component'
import { Prop } from 'vue-property-decorator'

import ProgressBar from '../component/ProgressBar.vue'

import { MasterData } from '../../ts/renderer/back/on-master-read'
import { startBatchDownload, stopBatchDownload, getBatchErrorList, setDownloaderProxy } from '../../ts/renderer/ipc-back'
import { updateClientProxy } from '../../ts/renderer/ipc'

@Component({
  components: {
    InputRadio,
    InputText,
    ProgressBar
  }
})
export default class extends mixins(modalMixin) {
  lang: 'zh' | 'ja' | 'en' = 'zh'
  resVer: string = ''
  gachaId: string = ''
  eventId: string = ''
  backgroundId: string = ''
  account: string = ''
  proxy: string = ''

  showBatchDownloadFeature: boolean = false
  card: 'default' | 'kirara' = 'default'
  lrcEncoding: 'utf8' | 'Windows932' | 'Windows936' = 'utf8'
  language: any = {
    zh: 'i18n.chinese',
    ja: 'i18n.japanese',
    en: 'i18n.english'
  }

  batchDownloading = false
  // @Prop({ default: () => ({}), type: Object }) master: MasterData
  // @Prop({ required: true }) latestResVer: string | number
  @Prop() value: string

  get master (): MasterData {
    return this.$store.state.master
  }

  get latestResVer (): number {
    return this.$store.state.latestResVer
  }

  get cardData (): any {
    return this.master.cardData ? this.master.cardData : {}
  }

  get eventData (): any {
    return this.master.eventAll ? this.master.eventAll : {}
  }
  // get gachaNow (): any {
  //   return this.master.gachaNow ? this.master.gachaNow : {}
  // }

  async batchDownload () {
    this.playSe(this.enterSe)
    this.batchDownloading = true
    try {
      await startBatchDownload()
    } catch (err) {
      this.event.$emit('alert', this.$t('home.errorTitle'), err.message)
    }
    this.batchDownloading = false
    const list = await getBatchErrorList()
    if (list.length > 0) {
      this.event.$emit('alertBatchError', list)
    }
  }

  async batchStop () {
    this.playSe(this.cancelSe)
    await stopBatchDownload()
    this.batchDownloading = false
  }

  save () {
    this.playSe(this.enterSe)
    let resVer: number | ''
    // let gachaId: number | ''
    let eventId: number | ''
    let backgroundId: number | ''
    let account: string
    let proxy: string = ''
    const card: 'default' | 'kirara' = this.card
    if (this.resVer) {
      if (
        Number(this.resVer) < 10012760 ||
        Number(this.resVer) % 10 !== 0 ||
        Number(this.resVer) > this.latestResVer
      ) {
        this.event.$emit('alert', this.$t('home.errorTitle'), 'resVer error')
        return
      } else {
        resVer = Number(this.resVer)
      }
    } else {
      resVer = ''
    }

    // if (this.gachaId) {
    //   if (
    //     Number(this.gachaId) < 30000 ||
    //     Number(this.gachaId) > this.gachaNow.id ||
    //     Math.floor(Number(this.gachaId)) !== Number(this.gachaId)
    //   ) {
    //     this.event.$emit(
    //       'alert',
    //       this.$t('home.errorTitle'),
    //       'gachaId error'
    //     )
    //     return
    //   } else {
    //     gachaId = Number(this.gachaId)
    //   }
    // } else {
    //   gachaId = ''
    // }

    if (this.eventId) {
      if (!this.eventData.filter((e: any) => Number(e.id) === Number(this.eventId)).length) {
        this.event.$emit(
          'alert',
          this.$t('home.errorTitle'),
          'eventId error'
        )
        return
      } else {
        eventId = Number(this.eventId)
      }
    } else {
      eventId = ''
    }

    if (this.backgroundId) {
      if (!this.cardData.filter((c: any) => Number(c.id) === Number(this.backgroundId)).length) {
        this.event.$emit(
          'alert',
          this.$t('home.errorTitle'),
          'backgroundId error'
        )
        return
      } else {
        backgroundId = Number(this.backgroundId)
      }
    } else {
      backgroundId = ''
    }

    if (this.account) {
      if (!/^[0-9]{9}:[0-9]{9}:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(this.account)) {
        this.event.$emit(
          'alert',
          this.$t('home.errorTitle'),
          'account error'
        )
        return
      } else {
        account = this.account
      }
    } else {
      account = this.account
    }

    if (this.proxy) {
      if (!/^(((pac\+)?https?)|(socks[45]?)):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]$/.test(this.proxy)) {
        this.event.$emit(
          'alert',
          this.$t('home.errorTitle'),
          'Invalid proxy'
        )
        return
      }
    }
    proxy = this.proxy

    this.$emit('input', this.language[this.lang])
    this._i18n._vm.locale = this.lang
    const optionsToSave = {
      language: this.lang,
      resVer: Number(resVer),
      // gacha: Number(gachaId),
      event: Number(eventId),
      background: Number(backgroundId),
      account: account,
      proxy: proxy,
      card: card,
      lrcEncoding: this.lrcEncoding
    }
    configurer.set(optionsToSave)
    const configProxy = optionsToSave.proxy ?? ''
    updateClientProxy(configProxy)
    setDownloaderProxy(configProxy)
    this.event.$emit('optionSaved', optionsToSave)
    this.visible = false
  }

  mounted () {
    this.$nextTick(() => {
      this.event.$on('option', async (showBatchDownload: boolean) => {
        this.showBatchDownloadFeature = showBatchDownload
        const config = configurer.getAll()
        this.lang = config.language || 'zh'
        this.resVer = config.resVer ? config.resVer.toString() : ''
        this.gachaId = config.gacha ? config.gacha.toString() : ''
        this.eventId = config.event ? config.event.toString() : ''
        this.backgroundId = config.background ? config.background.toString() : ''
        this.account = config.account ? config.account : ''
        this.proxy = config.proxy ? config.proxy : ''
        this.card = config.card ? config.card : 'default'
        this.lrcEncoding = config.lrcEncoding ? config.lrcEncoding : 'utf8'
        this.show = true
        this.visible = true
      })
      this.event.$on('enterKey', (block: string) => {
        if (block === 'menu' && this.visible) {
          this.save()
        }
      })
    })
  }
}
</script>

<style>
.option-input {
  margin: 0;
  width: 70%;
  display: flex;
}
.option-input > div {
  width: 30%;
}
.option-line {
  display: flex;
}
.option-line > label {
  width: 30%;
}
.margin-left-50 {
  margin-left: 50px;
}

.batch-area {
  display: flex;
  align-items: flex-end;
}

.batch-area .batch-btn {
  flex: 3
}
.batch-area .batch-prog {
  flex: 7
}
.batch-area .batch-prog .status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  height: 30px;
}
</style>
