<template>
<div v-show="show" class="modal">
  <transition name="scale" @after-leave="afterLeave">
    <div :style="{ width: modalWidth }" v-if="visible">
      <div class="modal-header">
        <title-dot v-once></title-dot>
        <h4 class="modal-title">{{$t("menu.option")}}</h4>
      </div>
      <div class="modal-body" :style="{ maxHeight: bodyMaxHeight }">
        <form>
          <div>
            <label>{{$t("menu.lang")}}</label>
            <div class="pull-right option-input clearfix" style="display:flex;justify-content:space-around">
              <radio :text="$t('i18n.chinese')" value="zh" v-model="lang" lable-id="razh"></radio>
              <radio :text="$t('i18n.japanese')" value="ja" v-model="lang" lable-id="raja"></radio>
            </div>
          </div>
          <div class="margin-top-10">
            <label>{{$t("menu.resVer")}}</label>
            <input-text class="pull-right option-input" :placeholder="`10012760 ≤ ${$t('menu.resVer')} ≤ ${latestResVer}`" v-model="resVer" />
          </div>
          <div class="margin-top-10">
            <label>{{$t("menu.gacha")}}</label>
            <input-text class="pull-right option-input" :placeholder="`30001 ≤ ${$t('menu.gacha')} ≤ ${gachaNow.id}`" v-model="gachaId" />
          </div>
          <div class="margin-top-10">
            <label>{{$t("menu.event")}}</label>
            <input-text class="pull-right option-input" :placeholder="$t('menu.eventPlacehoder') + 'bgm_event_ID'" v-model="eventId" />
          </div>
          <div class="margin-top-10">
            <label>{{$t("menu.background")}}</label>
            <input-text class="pull-right option-input" :placeholder="$t('menu.backPlacehoder')" v-model="backgroundId" />
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="cgss-btn cgss-btn-ok" @click="save">{{$t("menu.save")}}</button>
        <button type="button" class="cgss-btn cgss-btn-default margin-left-50" @click="close">{{$t("home.close")}}</button>
      </div>
    </div>
  </transition>
</div>
</template>

<script>
import modalMixin from '../../js/renderer/modalMixin.js'
import radio from '../component/radio.vue'
import inputText from '../component/inputText.vue'
export default {
  mixins: [modalMixin],
  components: {
    radio,
    inputText
  },
  data () {
    return {
      lang: '',
      resVer: '',
      gachaId: '',
      eventId: '',
      backgroundId: '',
      language: {
        zh: 'i18n.chinese',
        ja: 'i18n.japanese'
      }
    }
  },
  props: {
    master: {
      type: Object,
      require: true
    },
    latestResVer: {
      type: [String, Number],
      require: true
    },
    value: {
      type: String
    }
  },
  computed: {
    cardData () {
      return this.master.cardData ? this.master.cardData : {}
    },
    eventData () {
      return this.master.eventAll ? this.master.eventAll : {}
    },
    gachaNow () {
      return this.master.gachaNow ? this.master.gachaNow : {}
    }
  },
  methods: {
    async save () {
      this.playSe(this.enterSe)
      let resVer, gachaId, eventId, backgroundId
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
        resVer = this.resVer
      }

      if (this.gachaId) {
        if (
          Number(this.gachaId) < 30000 ||
          Number(this.gachaId) > this.gachaNow.id ||
          Math.floor(Number(this.gachaId)) !== Number(this.gachaId)
        ) {
          this.event.$emit(
            'alert',
            this.$t('home.errorTitle'),
            'gachaId error'
          )
          return
        } else {
          gachaId = Number(this.gachaId)
        }
      } else {
        gachaId = this.gachaId
      }

      if (this.eventId) {
        if (!this.eventData.filter(e => e.id == this.eventId).length) {
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
        eventId = this.eventId
      }

      if (this.backgroundId) {
        if (!this.cardData.filter(c => c.id == this.backgroundId).length) {
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
        backgroundId = this.backgroundId
      }

      this.$emit('input', this.language[this.lang])
      this._i18n._vm.locale = this.lang
      await this.configurer.configure({
        language: this.lang,
        resVer,
        gacha: gachaId,
        event: eventId,
        background: backgroundId
      })
      this.visible = false
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.event.$on('option', async () => {
        let config = await this.configurer.getConfig()
        this.lang = config.language ? config.language : ''
        this.resVer = config.resVer ? config.resVer : ''
        this.gachaId = config.gacha ? config.gacha : ''
        this.eventId = config.event ? config.event : ''
        this.backgroundId = config.background ? config.background : ''
        this.show = true
        this.visible = true
      })
      this.event.$on('enterKey', block => {
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
}
.margin-left-50 {
  margin-left: 50px;
}
</style>
